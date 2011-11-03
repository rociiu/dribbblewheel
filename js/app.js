var DW_CURRENT_PAGE_NUMBER = 1;
var DW_PER_PAGE = 10;
var DW_MODE = 'popular';
var DW_PLAYER_USERNAME = null;

$(function(){
    
    var current_slide_width = 412;
    
    function init_slides_width() {
        var window_width = $(window).width();
        var slides_width = (window_width / 2) - (current_slide_width / 2) - 20;
        $("div#past_slides, div#future_slides").css('width', slides_width);
    }
    
    init_slides_width();
    
    function init_slides() {
        if (DW_MODE == 'following') {
            $.jribbble.getShotsThatPlayerFollows(DW_PLAYER_USERNAME, function (followedShots) {
                insert_shots(followedShots['shots']);
            }, {page: DW_CURRENT_PAGE_NUMBER, per_page: DW_PER_PAGE});
        } else {
            $.jribbble.getShotsByList(DW_MODE, function (listDetails) {
                insert_shots(listDetails['shots']);
            }, {page: DW_CURRENT_PAGE_NUMBER, per_page: DW_PER_PAGE});
        }
    }
    
    function insert_shots(shots) {
        $.each(shots, function(i, value) {
            var slide = generate_slide(value);
            if (i === 0) {
                $("#current_slide .slide").replaceWith(slide);
            } else {
                $("#future_slides").append(slide);
            }
        });
    }
    
    function fetch_player_id() {
        if (DW_PLAYER_USERNAME != null) return;
        var player_username = prompt("Enter your dribbble username: ");
        DW_PLAYER_USERNAME = player_username;
    }
    
    init_slides();
    
    function pop_slide_from_past() {
        pop_slide('past_slides', 'future_slides');
    }
    
    function pop_slide_from_future() {
        pop_slide('future_slides', 'past_slides');
    }
    
    function pop_slide(from, to) {
        if ($("#"+from+" .slide").length === 0) {
            return;
        }
        var new_slide = $($("#"+from+" .slide")[0]);
        var new_slide_clone = new_slide.clone();
        var old_slide = $("#current_slide .slide");
        var old_slide_clone = old_slide.clone();
        new_slide.remove();
        $("#current_slide .slide").replaceWith(new_slide_clone);
        $("#"+to).prepend(old_slide_clone);
        check_more_slides();
    }
    
    function check_more_slides() {
        if ($("#future_slides .slide").length == 0) {
            load_more_slides();
        }
    }
    
    function generate_slide(data) {
        return $.tmpl( slide_template(), {
                   image_teaser_url: data['image_teaser_url'],
                   image_url: data['image_url'],
                   title: data['title'],
                   player_name: data['player']['name'],
                   likes_count: data['likes_count'],
                   comments_count: data['comments_count'],
                   views_count: data['views_count'],
                   player_url: data['player']['url'],
                   player_avatar_url: data['player']['avatar_url']
               });
    }
    
    function slide_template() {
        var template = '\
        <div class="slide">\
            <img class="small" src="${image_teaser_url}" />\
            <img class="large" src="${image_url}">\
            <div class="info">\
                <div class="dribbble_info">\
                    <p class="title"><span>${title}</span></p>\
                    <p class="stat"><span class="views">${views_count}</span><span class="comments">${comments_count}</span><span class="likes">${likes_count}</span></p>\
                </div>\
                <div class="user_info">\
                    <a href="${player_url}" target="_blank">${player_name}</a>\
                    <img src="${player_avatar_url}" />\
                </div>\
            </div>\
        </div>\
        ';
        return template;
    }
    
    function load_more_slides() {
        $("#loading").show();
        DW_CURRENT_PAGE_NUMBER = DW_CURRENT_PAGE_NUMBER + 1;
        $.jribbble.getShotsByList('popular', function (listDetails) {
            $("#loading").hide();
            $.each(listDetails['shots'], function(i, value) {
                var slide = generate_slide(value);
                $("#future_slides").append(slide);
            });
        }, {page: DW_CURRENT_PAGE_NUMBER, per_page: DW_PER_PAGE});
        
    }
    
    function reset_dw_mode(new_mode) {
        cleanup_slides();
        DW_MODE = new_mode;
        DW_CURRENT_PAGE_NUMBER = 1;
        init_slides();
    }
    
    function cleanup_slides() {
        $("#past_slides .slide").remove();
        $("#future_slides .slide").remove();
        $("#current_slide .slide").html('');
    }
    
    $(document).keydown(function(event) {
        // right arrow
        if (event.keyCode == 39) {
            pop_slide_from_future();
        }
        //left arrow 
        if (event.keyCode == 37) {
            pop_slide_from_past();
        }
    });
    
    $(window).resize(function() {
        init_slides_width();
    });
    
    $("#head ul li a").click(function(){
        if ($(this).hasClass("active")) {return;}
        if ($(this).attr('rel') == 'following') {
            fetch_player_id();
            if (DW_PLAYER_USERNAME == null) {
                return;
            }
        }
        $("#head ul li a").removeClass('active');
        $(this).addClass("active");
        reset_dw_mode($(this).attr('rel'));
    });
    
    $("#past_slides .slide img").live('click', function(event){
        var slide = $(this).parent();
        var index = $(slide).index();
        for (var i=0; i < index + 1; i++) {
            pop_slide_from_past();
        };
    });
    
    $("#future_slides .slide img").live('click', function(event){
        var slide = $(this).parent();
        var index = $(slide).index();
        for (var i=0; i < index + 1; i++) {
            pop_slide_from_future();
        };
    });
});