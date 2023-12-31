'use strict';

$(document).on('readystatechange', function () {

    if (document.readyState !== 'complete') {
        return;
    }


    window.cs = new Settings();
    window.cs.Open();

    $(".file-upload").on('change', function(e){
        try {
            loadImage(
                e.target.files[0],
                function (img, data) {
                    if (img.type === "error") {
                        console.error("Error loading image ");
                    } else {

                        let this_img = img.toDataURL();

                        $('.avatar').attr('src', this_img);

                        $('.avatar').siblings('input:file').attr('changed',true);
                        console.log("Original image width: ", data.originalWidth);
                        console.log("Original image height: ", data.originalHeight);

                    }
                },
                {
                    orientation: true,
                    maxWidth: 500,
                    maxHeight: 200,
                    minWidth: 100,
                    minHeight: 50,
                    canvas: true
                }
            );
        }catch(ex){
            console.log(ex);
        }

    });
});


class Settings {
    constructor(){

    }

    Open() {
        let that = this;
        that.fillForm();

        $('.submit').on('click', this, function (ev) {
            that.Close();
        });

        $('input').on('change', function (ev) {
           $(this).attr('changed', true);
        });
    }

    fillForm(){
        let items = JSON.parse(localStorage.getItem('kolmit_abonent'));
        if(items)
        $('input').each(function (index, el) {
            if(items[el.id]){
                if($('#'+el.id).attr('type')==='file'){
                    $('img.'+el.id).attr('src',items[el.id]);
                }else{
                    $('#'+el.id).val(items[el.id]);
                }

                return;
            }

        });
    }

    Close() {
        let items = this.GetProfileItems();
        localStorage.setItem('kolmit_abonent',JSON.stringify(items));
        window.parent.$('#kolmit_settings').remove();
    }

    GetProfileItems(){
        let that  = this;

        let profile = {};
        $('input').each(function (index, inp) {
            if($(this).attr('type')==='file'){
                profile['avatar'] = $(this).siblings('img').attr('src');
                return;
            }
            profile[inp.id] = $(inp).val();
        });
        return profile;
    }

}

