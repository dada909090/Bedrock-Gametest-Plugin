import { world } from "mojang-minecraft";
import * as ui from 'mojang-minecraft-ui';
import { pluginDB, minTranferLimit, maxTranferLimit } from "../config.js";
import { cmd, GetScores, log, logfor, SetScores, AddScores } from '../lib/GameLibrary.js';

export const moneyObjective = pluginDB.table("moneySetting").getData("scoreboard") ?? "money";

function MoneySystem(player) {
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
        if(!response) return;
        
        switch(response.selection){
            case (0): {
                let fm = new ui.ModalFormData();
                fm.title("付款");
                fm.dropdown("選擇目標玩家", playerNames);
                fm.textField("輸入付款的數額", "");

                fm.show(player).then(response => {
                    if (!response) return;
                    if (!response.formValues[1] || isNaN(response.formValues[1])) return logfor(player, ">> §c金額必須為數字！");
                    if (
                        (!response.formValues[1] < minTranferLimit && minTranferLimit > 1)
                        || (response.formValues[1] > maxTranferLimit && maxTranferLimit > 1)
                        || (response.formValues[1] < 1)
                    ) return logfor(player, `>> §c金額不能少於${minTranferLimit} / 大於${maxTranferLimit}！`);

                    let money = GetScores(`"${player.name}"`, moneyObjective)
                    if(isNaN(money)) return logfor(player, `>> §c未知錯誤`);

                    if(money < +response.formValues[1]) return logfor(player, `>> §c你沒有足夠的金幣！`);
                    
                    let target = players[response.formValues[0]];

                    AddScores(`"${target.name}"`, moneyObjective, +response.formValues[1])
                    SetScores(`"${player.name}"`, moneyObjective, money - response.formValues[1])
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