import { world } from "mojang-minecraft";
import * as ui from 'mojang-minecraft-ui';
import { pluginDB } from "../config.js";
import { cmd, log, logfor, cmds } from '../lib/GameLibrary.js';
import { getItemCount } from '../lib/util.js';
import { WorldDB, ScoreboardDB } from '../lib/WorldDB.js';

export const maxSelect = 128
const dbName = pluginDB.table("moneySetting").getData("scoreboard") ?? "money";
export const moneyTable = new ScoreboardDB(dbName);

export const buyableItems = [
    {
        display: '§7鐵錠',
        id: 'minecraft:iron_ingot',
        price: 300
    },
    {
        display: '§b鑽石',
        id: 'minecraft:diamond',
        price: 500
    },
    {
        display: '§a綠寶石',
        id: 'minecraft:emerald',
        price: 750
    },
    {
        display: '§d下屆合金',
        id: 'minecraft:netherite_ingot',
        price: 1000
    },
]
export const sellableItems = [
    {
        display: '§7鐵錠',
        id: 'minecraft:iron_ingot',
        price: 250
    },
]
export function ShopSystem(player) {
    let fm = new ui.ActionFormData();
    fm.title("noone");
    fm.body("noone");
    fm.button('§l§1購買');
    fm.button('§l§1出售');

    fm.show(player).then(response => {
        if (!response || response.isCanceled) { return }
        
        switch(response.selection){
            case (0): {
                let fm = new ui.ActionFormData();
                fm.title("購買");
                buyableItems.forEach((f) => {fm.button(f.display, f.icon ?? "")});

                fm.show(player).then(response => {
                    if (!response || response.isCanceled) return;

                    if(buyableItems[response.selection]){
                        const item = buyableItems[response.selection];
                        let money = moneyTable.getScore(player);
                        const maxCount = money / item.price;
                        if(moneyTable.getScore(player) < item.price) return logfor(player, `>> 你沒有足夠的金錢買一個${item.display}!`);
                        let fm = new ui.ModalFormData();
                        fm.slider("你要買多少個？", 0, Math.min(maxCount, maxSelect), 1, maxCount);

                        fm.show(player).then((response) => {
                            let count = response.formValues[0];
                            cmds([
                                `give ${player.name} ${item.id} ${response.formValues[0]} `
                            ]);
                            logfor(player, `>> 成功購買${count}個${item.display}!`);
                            moneyTable.removeScore(player, count * item.price);
                        })
                    }
                })
            }
            case (1): {
                let fm = new ui.ActionFormData();
                fm.title("出售");
                sellableItems.forEach((f) => {fm.button(f.display, f.icon ?? "")});
                fm.show(player).then(response => {
                    if (!response || response.isCanceled) return;

                    if(sellableItems[response.selection]){
                        const item = sellableItems[response.selection];
                        const count = getItemCount(player, item.id, item.data ?? 0)[0]?.count || 0;
                        if(count) return logfor(player, `>> 你沒有足夠的物品出售${item.display}!`);
                        let fm = new ui.ModalFormData();
                        fm.slider("你要出售多少個？", 0, Math.min(count, maxSelect), 1, count);
                        fm.show(player).then((response) => {
                            let count = response.formValues[0];
                            cmds([
                                `clear ${player.name} ${item.id} ${response.formValues[0]}`
                            ]);
                            logfor(player, `>> 成功出售${count}個${item.display}!`);
                            moneyTable.addScore(player, count * item.price);
                        })
                    }
                })
                return;
            }
        }
    });
}