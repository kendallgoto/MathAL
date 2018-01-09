var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;
    return function(obj, callback){
        if( MutationObserver ){
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length ) 
                    callback();
            });
            obs.observe( obj, { attributes:false, childList:true, subtree:false });
        }
    };
})();
var MQ = MathQuill.getInterface(2);

$(function() {
	//var loadObserveOnce = 0;
	captureTextWindows();
	var refresh = setInterval(function() {
		console.log("checking elements");
			// observeDOM(document.getElementsByClassName('textSectionContainer')[0], function() {
			// 	console.log("mutate detected");
			// 	captureTextWindows();
			// });
		captureTextWindows();
		convertMathIfPresent();
	}, 1500);
});
function captureTextWindows() {
	$('.questionTagAnswer[style="display: block;"] > div[contenteditable=true]').off('focus').focus(function() {
		console.log("Focused!");
		insertFloatingMath(this);
	}).blur(function() {
		console.log("Unfocused!");
		removeFloatingMath(this);
	});
}
function insertFloatingMath(atEle) {
	//new element for clickin
	//inside .questionTagAnswer -->
	var trig = $('<div class="mathALTrigger">M+</div>');
	$(atEle).data('trigger', trig);
	trig.appendTo($(atEle).closest(".questionTagAnswer"));
	mathClickRegister();
	
}
function removeFloatingMath(atEle) {
	if($(atEle).data('trigger')) {
		$(atEle).data('trigger').remove();
	}
}
function mathClickRegister() {
	$('.mathALTrigger').off('mousedown').on('mousedown', function() {
		//open the popup!
		console.log("aa");
		$('.mathALPopup').remove();
		var mathWindow = $('<div class="mathALPopup"><div class="mathWindow"><span id="math-field"></span><div class="goBtn">&rarr;</div></div></div>');
		mathWindow.appendTo('body');
		var field = MQ.MathField(document.getElementById('math-field'), {
			spaceBehavesLikeTab: true,
			autoCommands: 'pi sqrt',
			autoOperatorNames: 'sin cos tan',
			handlers: {
				/*
				enter: function() {
					enterCommand();
				},
				edit: function(msg) {
					if(field.latex() == "\\sqrt{2}" && latexPrev == "\\sqrt{ }")
						field.moveToRightEnd();
					if(field.latex() == "\\sqrt{3}" && latexPrev == "\\sqrt{ }")
						field.moveToRightEnd();
					latexPrev = field.latex();
				}
				*/
			}
		});
		$('.mathALPopup').click(function(e) {
			if(e.currentTarget == e.target)
				dismissALPop();
		});
		$(document).on('keyup.mathALListener', function(e) {
		     if (e.keyCode == 27) {
		        dismissALPop();
		    }
		});
		
		$('.goBtn').click(function() {
			//process!
			var toText = field.text();
			var toLatex = field.latex();
			$('.mathWindow').children().remove();
			$('<textarea class="mathResult"></textarea><div class="mathDesc">Ctrl/Cmd+C!</div>').appendTo('.mathWindow');
			$('.mathResult').val("~~"+toLatex+"~\r\n"+toText+"\r\n(MathAL Chrome Extension)~");
			$('.mathWindow').css('flex-direction', 'column');
			$('.mathResult').select();
			$('.mathResult').bind('copy', function() {
				setTimeout(function() {
					dismissALPop();
				}, 100)
			});
		})
	});
}
function dismissALPop() {
	$('.mathALPopup').remove();
	$(document).unbind('keyup.mathALListener');
}

function convertMathIfPresent() {
	//Make latex into a viewable form!
	$('.responseContainer .text').each(function(indx, ele){
		if($(ele).text().indexOf('~~') == -1)
			return true;
		//find our text blob
		$(':contains(~~)', ele).each(function(indx, mainLatex) {
			mainLatex = $(mainLatex);
			var plaintext = mainLatex.next();
			var ad = plaintext.next();
			plaintext.remove();
			ad.remove();
			mainLatex.text(mainLatex.text().replace("~~", "").replace("~",""));
			MQ.StaticMath(mainLatex.get(0));
		})
	})
}