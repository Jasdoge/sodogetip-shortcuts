
(function(){

    let SDT = {
        config : {
            verify : true
        }
    };

    function rebindDogeTip(){
        console.log("Attaching doge tip");
	}
	

    SDT.install = function(){

        if(localStorage.SDT)
			SDT.config = JSON.parse(localStorage.SDT);
		
		let ptype = SDT.getPageType(),
			pageScan = 'body > div.content',					// Top element to set the live event listeners on
			insertAt = 'div.commentarea button.save',			// Where do we place the button?
			formTarg = 'div.commentarea > form',				// Which form should we validate immediately?
			areaTarg = 'textarea[data-event-action=comment]'	// How do we find the textarea to keep live events on?
		;
		
		// Page specific selectors

		// Messaging - Maybe add other hotkeys here later?
		if(ptype === SDT.PTYPE_COMPOSE){
			/*
			insertAt = "#compose-message div.bottom-area";
			formTarg = '#compose-message';
			areaTarg = '#compose-message textarea[name=text]';
			*/
		}
		// Inbox
		else if(ptype === SDT.PTYPE_INBOX){
			insertAt = "form.usertext:first > div.usertext-edit > div.bottom-area";
			formTarg = false;
			areaTarg = 'form.usertext div.md > textarea[name=text]';
		}

		// User page
		else if(ptype === SDT.PTYPE_USER){

			// Comments in the user page are added by JS when reply is clicked
			insertAt = false;
			formTarg = false;
			areaTarg = 'form.MarkdownForm > textarea.MarkdownForm__text';
			pageScan = 'div.CommentListing';

			$("div.CommentListing").on('click', 'a.CommentFlatList__item', function(){
								
				let top = $(this).closest('div.Comment__content'); //.find('form.MarkdownForm');
				setTimeout(function(){
					let form = top.find('form.MarkdownForm');
					SDT.insert($('div.MarkdownForm__footer', form));
				}, 10);
				
				
			});
		}

		if(insertAt)
			SDT.insert(insertAt);

		$(pageScan)
		.on('click', 'input.sodogetip', function(event){
			
			let form = $(this).closest('form');
			SDT.attach(form);

		})
		.on('change keyup', areaTarg, function(){
			SDT.check($(this).closest('form'));
		})
		.on('change keyup', 'input.sodogetip_verify', function(){
			SDT.config.verify = $(this).prop('checked');
			SDT.save();
		})
		.on('keydown', 'input.sodogetip_amount', function(event){

			event.stopImmediatePropagation();

			if(event.originalEvent.keyCode === 13){
				SDT.attach($(this).closest('form'));
				return false;
			}

		});

		if(formTarg)
        	SDT.check($(formTarg));

	};

	SDT.insert = function(insertAt){

		$(insertAt).before('<div class="dogetipblock">'+
			'<input type="button" class="sodogetip" value="Attach Doge Tip" />'+
			'<input type="number" title="How many dogecoins do you want to tip?" step=1 value=10 min=1 class="sodogetip_amount hideIfTipped" />'+
			'<label class="hideIfTipped verify" title="Makes the bot reply to your post if the tip was successful. Recommended for large tips."> Verify <input type="checkbox" value=1 class="sodogetip_verify" '+(SDT.config.verify ? 'checked' : '')+' /></label>'+
		'</div>');
		
	};
	
	// Returns the supported page ID
	SDT.getPageType = function(){
		let url = window.location.href.split('/');
		
		if(url[3] === 'message' && url[4] === 'compose')
			return SDT.PTYPE_COMPOSE;
		else if(url[3] === 'message')
			return SDT.PTYPE_INBOX;
		else if(url[3] === 'user')
			return SDT.PTYPE_USER;
		return SDT.PTYPE_DEFAULT;

	};
	// View post page
	SDT.PTYPE_DEFAULT = 'default';
	// Compose PM
	SDT.PTYPE_COMPOSE = 'compose';
	// User page
	SDT.PTYPE_USER = 'user';
	// Inbox comment replies
	SDT.PTYPE_INBOX = 'inbox';


	// Saves localstorage config
    SDT.save = function(){
        localStorage.SDT = JSON.stringify(SDT.config);
    };

    // Returns the comment text area for the form
    SDT.getTextAreaFromForm = function(form){
		let type = SDT.getPageType(),
			targ = 'textarea[data-event-action=comment]'
		;
		if(type === SDT.PTYPE_COMPOSE || type === SDT.PTYPE_INBOX)
			targ = 'textarea[name=text]';
		else if(type === SDT.PTYPE_USER)
			targ = 'textarea.MarkdownForm__text';
		
        return form.find(targ);
    };
    // Removes the doge amount box from the form
    SDT.getAmountBoxFromForm = function(form){
        return form.find('input.sodogetip_amount');
    };
    // Returns the tip div from the form
    SDT.getBlockFromForm = function(form){
        return form.find('div.dogetipblock');
    };
    // Returns the tip button from the form
    SDT.getButtonFromForm = function(form){
        return form.find('input.sodogetip');
    };
    // Returns the verify checkbox from the form
    SDT.getVerifyFromForm = function(form){
        return form.find('input.sodogetip_verify');
    };
    
    
    
    
    // Checks if there's an attached tip or not and updates the button
    SDT.check = function(form){

        let textArea = SDT.getTextAreaFromForm(form);  

        let text = textArea.val().split("\n");
        for(let sub of text){

            if(sub.startsWith("+/u/sodogetip ")){

                SDT.getBlockFromForm(form).toggleClass("active", true);
                SDT.getButtonFromForm(form).val('Remove Doge Tip');
                return true;               

            }

        }

        SDT.getBlockFromForm(form).toggleClass("active", false);
        SDT.getButtonFromForm(form).val('Add Doge Tip:');
        return false;

    };

    
    // Removes dogetip
    SDT.remove = function(form){

        let text = SDT.getTextAreaFromForm(form).val().split("\n"),
            out = []
        ;

        for(let sub of text){

            if(!sub.startsWith("+/u/sodogetip "))
                out.push(sub);

        }

        SDT.getTextAreaFromForm(form).val(out.join("\n"));
        SDT.check(form);

    };

    // Attach a tip
    SDT.attach = function(form){

        if(SDT.check(form)){
            SDT.remove(form);
            return;
        }


        let amount = Math.round(Math.abs(SDT.getAmountBoxFromForm(form).val()));
        if(!amount)
            return;

        let text = SDT.getTextAreaFromForm(form).val(),
            spl = text.split("\n");
        if(text.trim().length && spl[spl.length-1].trim() !== '')
            text+= "\n";
		text+= "+/u/sodogetip "+amount+" doge";
		if(SDT.getVerifyFromForm(form).prop("checked"))
			text += " verify";

        SDT.getTextAreaFromForm(form).val(text);
        SDT.check(form);

    };


    // ini
    SDT.install();


    

})();
