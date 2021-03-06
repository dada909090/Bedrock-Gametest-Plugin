import { world } from "mojang-minecraft";
import * as ui from 'mojang-minecraft-ui';
import { pluginDB } from "../config.js";
import { cmd, GetScores, log, logfor, SetScores, AddScores } from '../lib/GameLibrary.js';
import { WorldDB, ScoreboardDB } from '../lib/WorldDB.js';

const dbName = pluginDB.table("moneySetting").getData("scoreboard") ?? "money";
export const moneyTable = new ScoreboardDB(dbName);

export function MoneySystem(player) {
    const worldPlayers = world.getPlayers();
    let players = [];
    let playerNames = [];

    for (let i of worldPlayers) {
        playerNames.push(i.name);
        players.push(i);
    }

    let fm = new ui.ActionFormData();
    fm.title("經濟菜單");
    fm.body("noone");
    fm.button('§l§1匯款');
    fm.button('§l§1簽到');

    fm.show(player).then(response => {
        if (!response || response.isCanceled) { return };
        
        switch(response.selection){
            case (0): {
                let fm = new ui.ModalFormData();
                fm.title("付款");
                fm.dropdown("選擇目標玩家", playerNames);
                fm.textField("輸入付款的數額", "");

                fm.show(player).then(response => {
                    if (!response || response.isCanceled) return;
                    if (!response.formValues[1] || isNaN(response.formValues[1])) return logfor(player, ">> §c金額必須為數字！");

                    let money = moneyTable.getScore(player)
                    if(isNaN(money)) return logfor(player, `>> §c未知錯誤`);

                    if(money < +response.formValues[1]) return logfor(player, `>> §c你沒有足夠的金幣！`);
                    
                    let target = players[response.formValues[0]];

                    moneyTable.addScore(`"${target.name}"`, +response.formValues[1])
                    moneyTable.setScore(`"${player.name}"`, money - response.formValues[1])
                    logfor(player.name, ">> §a給予成功!");
                    return logfor(target.name, `>> §a你收到了${player.name}的${response.formValues[1]}$!`);
                })
            }
            case (1): {
                return;
            }
        }
    });
}