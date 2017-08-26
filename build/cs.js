
(function(){

    let SDT = {};

    function rebindDogeTip(){
        console.log("Attaching doge tip");
    }

    SDT.install = function(){

        $("div.commentarea button.save").before('<div class="dogetipblock">'+
            '<input type="button" class="sodogetip" value="Attach Doge Tip" />'+
            '<input type="number" step=1 value=10 min=1 class="sodogetip_amount" />'+
        '</div>');

        let block = $("div.dogetipblock"),
            form = $('div.commentarea > form')
        ;

        $("body > div.content")
        .on('click', 'input.sodogetip', function(event){
            
            let form = $(this).closest('form');
            SDT.attach(form);

        })
        .on('change keyup', 'textarea[data-event-action=comment]', function(){
             SDT.check($(this).closest('form'));
        })
        .on('keydown', 'input.sodogetip_amount', function(event){

            event.stopImmediatePropagation();

            if(event.originalEvent.keyCode === 13){
                SDT.attach($(this).closest('form'));
                return false;
            }

        });

        SDT.check(form);

    };

    // Returns the comment text area for the form
    SDT.getTextAreaFromForm = function(form){
        return form.find('textarea[data-event-action=comment]');
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

        SDT.getTextAreaFromForm(form).val(text);
        SDT.check(form);

    };


    // ini
    SDT.install();


    

})();
