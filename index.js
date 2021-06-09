const JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const POLLING_RATE = 333;

const JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

var StashState = "Small";
var count = 0;

window.onload = function () {
	getData();
	setInterval(getData, POLLING_RATE);
};

var Asc = function (a, b) {
	if (a > b) return +1;
	if (a < b) return -1;
	return 0;
};

var Desc = function (a, b) {
	if (a > b) return -1;
	if (a < b) return +1;
	return 0;
};

function getData() {
	fetch(JSON_ENDPOINT)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			appendData(data);
		})
		.catch(function (err) {
			console.log("Error: " + err);
		});
}

function appendData(data) {
	var mainContainer = document.getElementById("inventory");
	mainContainer.innerHTML = "";

	var keyItems = data.PlayerInventory.filter((item) => {
		return item.IsKeyItem && item.ItemName == "ExtraBaggage";
	});
	
	//console.log(keyItems);

	if (keyItems.length == 1) {
		GetInventorySize(keyItems[0].StackSize);
	} else {
		GetInventorySize(0);
	}

	//console.log(StashState);
	var inventoryItems = data.PlayerInventory.filter((item) => {
		return (item.IsItem && !item.IsAmmoClip && !item.IsHidden) || item.IsWeapon;
	});

	inventoryItems
		.sort(function (a, b) {
			return Asc(a.SlotNo, b.SlotNo);
		})
		.map((i) => {
			SetItems(i);
		});
		//DebugMe(data);
}

function DebugMe(data) {
	var first = document.getElementById("first");
	var last = document.getElementById("last");
	let firstItem = data.PlayerInventory[0];
	if (firstItem.ItemName == "None") {
		first.innerHTML = `First Item - Unknown Item: 0x${lastItem.ItemID.toString(
			16
		).toUpperCase()}`;
	} else {
		first.innerHTML = `First Item - ${
			firstItem.ItemName
		}: 0x${firstItem.ItemID.toString(16).toUpperCase()}`;
	}

	let lastItem = GetLastItems(data.PlayerInventory);
	if (lastItem.ItemName == "None") {
		last.innerHTML = `Last Item - Unknown Item: 0x${lastItem.ItemID.toString(
			16
		).toUpperCase()}`;
	} else {
		last.innerHTML = `Last Item - ${
			lastItem.ItemName
		}: 0x${lastItem.ItemID.toString(16).toUpperCase()}`;
	}
}

function GetLastItems(inventory) {
	for (var i = 0; i < inventory.length; i++) {
		if (inventory[i].ItemID == 0xffffffff) {
			//console.log(i);
			return inventory[i - 1];
		}
	}
}

function SetItems(item) {
	let mainContainer = document.getElementById("inventory");
	var IsHorizontal = item.IsHorizontal == 1 ? "" : "Vertical";
	var IsQuickSlot =
		item.QuickSlotHash == 4093525667
			? `<div class="Equip1"></div>`
			: item.QuickSlotHash == 2032792067
			? `<div class="Equip2"></div>`
			: item.QuickSlotHash == 249966296
			? `<div class="Equip3"></div>`
			: item.QuickSlotHash == 2311674127
			? `<div class="Equip4"></div>`
			: "";
	var MaxStackSize =
		item.CustomParameter.StackSize + item.CustomParameter.ExtendedStackSize;
	var ColorStack =
			MaxStackSize == 1 ? `` :
		item.StackSize == MaxStackSize
			? `<div class="quantity"><font color="#00FF00">${item.StackSize}</font></div>`
			: `<div class="quantity">${item.StackSize}</div>`;
	var ColorIncludedStack =
			MaxStackSize == 1 ? `` :
		item.IncludeStackSize == MaxStackSize
			? `<div class="quantity"><font color="#00FF00">${item.IncludeStackSize}</font></div>`
			: item.IncludeStackSize < MaxStackSize / 4
			? `<div class="quantity"><font color="#FF0000">${item.IncludeStackSize}</font></div>`
			: `<div class="quantity">${item.IncludeStackSize}</div>`;
	if (item.SlotNo < 9) {
		if (item.IsItem) {
			mainContainer.innerHTML += `
				<div class="slot${item.SlotNo}">
					<div class="${GetItemSize(item)}">
						<div id="${item.ItemName}${IsHorizontal}">
							${IsQuickSlot}
							${ColorStack}
						</div>
					</div>
				</div>`;
		} else if (item.IsWeapon) {
			mainContainer.innerHTML += `
				<div class="slot${item.SlotNo}">
					<div class="${GetItemSize(item)}">
						<div id="${item.ItemName}${IsHorizontal}">
							${IsQuickSlot}
							${ColorIncludedStack}
						</div>
					</div>
				</div>`;
		}
	} else {
		if (item.IsItem) {
			mainContainer.innerHTML += `
				<div class="slot${item.SlotNo}${StashState}">
					<div class="${GetItemSize(item)}">
						<div id="${item.ItemName}${IsHorizontal}">
							${IsQuickSlot}
							${ColorStack}
						</div>
					</div>
				</div>`;
		} else if (item.IsWeapon) {
			mainContainer.innerHTML += `
				<div class="slot${item.SlotNo}${StashState}">
					<div class="${GetItemSize(item)}">
						<div id="${item.ItemName}${IsHorizontal}">
							${IsQuickSlot}
							${ColorIncludedStack}
						</div>
					</div>
				</div>`;
		}
	}
}

function GetInventorySize(size) {
	let mainContainer = document.getElementById("inventory");
	if (size == 1) {
		StashState = "Medium";
		mainContainer.innerHTML += `<div id="InventoryMedium"></div>`;
		return;
	} else if (size == 2) {
		StashState = "Large";
		mainContainer.innerHTML += `<div id="InventoryLarge"></div>`;
		return;
	} else if (size == 3) {
		StashState = "XLarge";
		mainContainer.innerHTML += `<div id="InventoryXLarge"></div>`;
		return;
	}
	StashState = "Small";
	mainContainer.innerHTML += `<div id="InventorySmall"></div>`;
	return;
}

function GetItemSize(item) {
	return `Slot${item.SizeX}x${item.SizeY}`;
}
