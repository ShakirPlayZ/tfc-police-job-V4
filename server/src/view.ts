import * as alt from 'alt-server';
import { Athena } from '@AthenaServer/api/athena';
import { command } from '@AthenaServer/decorators/commands';
import {CHARACTER_PERMISSIONS, PERMISSIONS} from '@AthenaShared/flags/permissionFlags';
import { isFlagEnabled } from '@AthenaShared/utility/flags';
import { TfcPoliceWebViewEvents } from '../../shared/viewInfo';
import {TFCPOLICE_EVENTS} from "./events";
import {ANIMATION_FLAGS} from "@AthenaShared/flags/animationFlags";
import sync from "@AthenaClient/extensions/vehicleFuncs/sync";
import {LocaleController} from "@AthenaShared/locale/locale";
import {LOCALE_KEYS} from "@AthenaShared/locale/languages/keys";

const InternalFuncs = {
    reanimateplayer(player: alt.Player, id: string) {
        alt.log("REANIMATE player: ", player.name);
        alt.log("REANIMATE target: ", id);

        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }
        if (!target.data.isDead) {
            return;
        }
        Athena.player.set.respawned(target, target.pos);
    },
}

export class TfcPoliceWebViewServer {
    static init() {
        console.log(`Commands for TFC PD Job Created`);
        alt.onClient(TfcPoliceWebViewEvents.WebViewToServer.REQUEST_REFRESH, TfcPoliceWebViewServer.handleRefresh);

        alt.onClient(TFCPOLICE_EVENTS.TO_SERVER.REANIMATEPLAYER, InternalFuncs.reanimateplayer);
    }

    @command('pdjob', '/pdjob - Job Menü anzeigen', PERMISSIONS.ADMIN | PERMISSIONS.MODERATOR | CHARACTER_PERMISSIONS.LSPD)
    static handleCommand(player: alt.Player) {
        alt.emitClient(player, TfcPoliceWebViewEvents.ClientServer.OPEN, TfcPoliceWebViewServer.getAvailablePlayers());
    }

    private static handleRefresh(player: alt.Player) {
        console.log('got refresh event');

        Athena.webview.emit(
            player,
            TfcPoliceWebViewEvents.ServerToWebView.REFRESH_PLAYERS,
            TfcPoliceWebViewServer.getAvailablePlayers(),
        );
    }

    private static getAvailablePlayers(): Array<any> {
        return [...alt.Player.all]
        .filter((x) => x.valid && x.data && x.data._id)
        .map((t) => {
            const id = Athena.systems.identifier.getIdByStrategy(t);
            return {
                id,
                name: t.data.name,
                ping: t.ping,
            };
        });
    }
}