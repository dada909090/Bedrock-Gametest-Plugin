import { world } from "mojang-minecraft";
import * as ui from 'mojang-minecraft-ui';
import { cmd, GetScores, log, logfor, SetScores } from '../lib/GameLibrary.js';
import { getData, setData } from '../lib/JsonTagDB';

import { WorldDB } from "../lib/WorldDB.js";
export const ExpDB = new WorldDB("xp");
export const LevelDB = new WorldDB("level");

export function LevelSystem(player){
    level = LevelDB.getRawData(player);
    exp = ExpDB.getRawData(player);

    if (level == null) { level = "0" };

    let fm = new ui.ActionFormData();

    fm.title(`等級系統`);
    fm.body(`您目前為§aLv.${level}§r\n\n等級獎勵:`);
    
    fm.button(`查看等級排名`,);

    fm.show(player).then(response => {
        if (!response) return;
    });
}