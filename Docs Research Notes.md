"docos docos-stream-view docos-layout-anchored docos-layout-vertical" class acts as "comment holder"
comment structure:
var par = $('.docos-docoview-tesla-conflict').eq(1)
$('.docos-anchoredreplyview-avatar-holder', par).remove();
$('.docos-anchoreddocoview-input-pane', par).remove();
$('.docos-author', par).text("Character Name");
$('.docos-replyview-resolve-button-original', par).text("Delete").attr('data-tooltip', "Remove this character note");
$('.docos-overflowmenu-outer', par).remove();
$('.docos-docoview-replycontainer', par).remove();
var body = $('.docos-replyview-static', par);

