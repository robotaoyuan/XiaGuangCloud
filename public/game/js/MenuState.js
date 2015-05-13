function OnEnterMenuState() {
    ptwUI.showMenuUI();
	initMenu();
	_hmt.push(['_trackPageview', '/start']);
}

function OnExitMenuState()
{
}

function initMenu() {
    var menuStart = $("#start-btnPlay");
    menuStart.click(function (evt) {
        SM.SetStateByName("preload");
    });
}

var MenuState = new State( OnEnterMenuState, OnExitMenuState );

