function game_ended() {
    return document.documentElement.innerHTML.indexOf('victo' + 'rious!') > -1;
}

function orders_in(str) {
    if (!str) {
        str = document.documentElement.innerHTML;
    }
    return str.indexOf('Your orders are ' + 'in for this turn.') > -1;

}

function init() {
    if (window.location.pathname !== '/warlocks' || game_ended()) {
        return;
    }
    if (Notification.permission === 'default') {
        Notification.requestPermission(function (permission) {});
    }

    if (orders_in()) {
        // Poll
        var poller = window.setInterval(function () {
            console.log("poll");
            var xhr = new XMLHttpRequest();
            xhr.open('GET', window.location.href, true);

            xhr.onload = function () {
                if (orders_in(xhr.responseText)) {
                    console.log("Still waiting..");
                } else {
                    window.clearInterval(poller);
                    if (Notification.permission === 'granted') {
                        var notification = new Notification("Warlocks: New turn!");
                    }
                    window.location.reload();
                }
            };
            xhr.send();
        }, 5000);
    } else {
        // Bind submit
        var form = document.querySelector("form");
        var submit_check = form.onsubmit.bind(form);
        console.log(form.onsubmit);
        form.onsubmit = function (e) {
            if (submit_check()) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", form.action, true);

                //Send the proper header information along with the request
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                xhr.onreadystatechange = function () { // Call a function when the state changes.
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                        // Request finished. Do processing here.
                        console.log("Orders sent!");
                        location.reload();
                    }
                };
                xhr.send([...new FormData(form).entries()].map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1])).join("&"));
            }
            return false;
        }.bind(form);
    }
}


init();
