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
var lastFocusArea;
$(function() {
	captureTextWindows();
	var refresh = setInterval(function() {
		console.log("checking elements");
		captureTextWindows();
		convertMathIfPresent();
		cleanHanging();
	}, 1500);
});
function cleanHanging() {
	//find our hangers
	$('*:contains("!{")', '.questionTagAnswer[style="display: block;"]').each(function(indx, ele) {
		$(ele).contents().filter(function(){
			if(this.nodeType == 3) return true;
		}).each(function(indx2, ele2) {
			console.log("errdet");
			if(!$(ele2).parent().is('sub')) {
				console.log('aa');
				console.log(ele2);
				while($(ele2).text().indexOf("!{") >= 0) {
					var trueRend = $(ele2).text();
					var finRend = trueRend.substring(0, trueRend.indexOf("!{")) + trueRend.substring(trueRend.indexOf("}!")+2);
					console.log(finRend);
					var newHTML = $(ele2).parent().html();
					newHTML = newHTML.substring(newHTML.indexOf("<", 5));
					$(ele2).parent().html(finRend + newHTML)
				}
			}
		});
	});
}
function captureTextWindows() {
	$('.questionTagAnswer[style="display: block;"] > div[contenteditable=true]').off('focus').focus(function() {
		console.log("Focused!");
		insertFloatingMath(this);
		if($(this).data('observe')) {
			$(this).data('observe').disconnect();
		}
		$(this).data('observe', observeDOM(this, function() {
			//make sure we good
			setTimeout(cleanHanging, 50)
		}));
	}).blur(function() {
		console.log("Unfocused!");
		removeFloatingMath(this);
	});
	document.addEventListener("selectionchange", function() {
		var ele = $(getSelection().anchorNode).eq(0);
		if($(ele).closest('.teacherQuestion [contenteditable]').length > 0) {
			lastFocusArea = $(getSelection().anchorNode).eq(0);
		}
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
		$('.mathALPopup').remove();
		var mathWindow = $('<div class="mathALPopup"><div class="mathWindow"><span id="math-field"></span><div class="goBtn">&rarr;</div></div></div>');
		mathWindow.appendTo('body');
		var field = MQ.MathField(document.getElementById('math-field'), {
			spaceBehavesLikeTab: true,
			autoCommands: 'pi sqrt int',
			autoOperatorNames: 'sin cos tan lim',
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
			var toText = field.text().replace(/\\s\*i\*n/g, 'sin').replace(/\\c\*o\*s/g, 'cos').replace(/\\t\*a\*n/g, 'tan').replace(/\\c\*o\*t/g, 'cot').replace(/\\s\*e\*c/g, 'sec').replace(/\\c\*s\*c/g, 'csc');
			var toLatex = field.latex()
			//inject html ...
			
			//$('.mathWindow').children().remove();
			//$('<textarea class="mathResult"></textarea><div class="mathDesc">Ctrl/Cmd+C!</div>').appendTo('.mathWindow');
			var html = "<p>|~ "+toText+" ~|<span><sub><sub><sub><sub><sub><sub><sub><sub><sub><sub><sub><sub>!{"+toLatex+"}!</sub></sub></sub></sub></sub></sub></sub></sub></sub></sub></sub></sub></span></p>";
			if(lastFocusArea[0] && lastFocusArea[0].nodeType == 3) {
				lastFocusArea = $(lastFocusArea).parent();
			}
			console.log(lastFocusArea);
			if($(lastFocusArea).text() == "")
				$(lastFocusArea).html(html);
			else
				$(lastFocusArea).html($(lastFocusArea).text() + $(html).unwrap().html());
			dismissALPop();
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
		//find our text blob
		$('sub > sub > sub', ele).each(function(indx, mainLatex) {
			//our sub sub sub blocks are our hidden data blocks! here's how they're organized:
			//<p> |~ real eq ~| <sub><sub><sub>latex</sub>
			//this means if we do closest(p) here, we can get our container element. then we can delete as necessary, and populate with our real cool latex!
			var parentCont = $(mainLatex).closest("p");
			var realLatex = $(mainLatex).text();
			//ok, lets parse through parent container ... if we can't find a margin limit, we're gonna have to delete the whole line :(
			var parentText = $(parentCont).text();
			var enclosurePlace = parentText.indexOf("|~ ");
			var saveText;
			if(enclosurePlace != -1) {
				//OK! we're good. copy all the text before here and we'll reinsert it in a second
				saveText = parentText.substring(0, enclosurePlace);
			} else {
				//well this is awkward ... i guess we're deleting everything :)
				saveText = "";
			}
			$(parentCont).text(saveText);
			var latexInsert = $('<p>'+realLatex.replace("!{", "").replace("}!", "")+'</p>');
			$(parentCont).append(latexInsert);
			MQ.StaticMath($(latexInsert).get(0));
		})
		
		if($(ele).text().indexOf('~~') == -1)
			return true;
		//legacy
		$(':contains(~~)', ele).each(function(indx, mainLatex) {
			mainLatex = $(mainLatex);
			var plaintext = mainLatex.next();
			var ad = plaintext.next();
			plaintext.remove();
			ad.remove();
			mainLatex.text(mainLatex.text().replace("~~", "").replace("~",""));
			MQ.StaticMath(mainLatex.get(0));
		});
	})
}