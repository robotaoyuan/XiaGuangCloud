function OnEnterFinishState() {
    ptwUI.showFinishUI();
    _hmt.push(['_trackPageview', '/finish']);
}

function OnExitFinishState()
{
}

var FinishState = new State( OnEnterFinishState, OnExitFinishState );

