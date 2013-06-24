$(function() {

    var templates = ['article', 'articleEdition', 'articleNew', 'newButton', 'user', 'userEdition'];

    function getTemplates(templates, callback) {
        var deferreds = [];

        $.each(templates, function(index, view) {
            deferreds.push($.get('/templates/admin/' + view + '.html', function(data) {
                app.templates[view] = _.template(data);
            }, 'html'));
        });

        $.when.apply(null, deferreds).done(callback);
    }

    getTemplates(templates, function() {
        app.articles = new Postit.Collections.Articles();
        app.users = new Postit.Collections.Users();

        Postit.adminRouter = new Postit.Routers.AdminRouter(app);

        Backbone.history.start({
            root : "admin",
            pushState : true,
            silent : false
        });
    });

    // function loadData(callback) {
    //     var xhrArticles = $.get('/articles');

    //     xhrArticles.done(function(data){
    //         console.log('Articles loaded', data);

    //         data.forEach(function(article){
    //             Postit.articles.add(article);
    //         });

    //         var xhrUsers = $.get('/users');

    //         xhrUsers.done(function(data){
    //             console.log('Users loaded', data);

    //             data.forEach(function(user){
    //                 Postit.users.add(user);
    //             });

    //             callback();
    //         });

    //         xhrUsers.fail(function(data) {
    //             console.log('Users 401');
    //         });
    //     });
    // }

    // loadData(function() {
    //     Backbone.history.start({
    //         root : "admin",
    //         pushState : true,
    //         silent : false
    //     });
    // });

    // Sockets events

    socket.on('notifications', function(data) {
        console.log('notifications ' + data);
        $('#notifications').html(data);

        setTimeout(function() {
            $('#notifications').html('<strong>Notifications</strong>');
        }, 5000);
    });

    socket.on('articles::create', function(data) {
        console.log('Articles::create ' + data);
        app.articles.add(data, {at: 0});
    });

    socket.on('users::create', function(data) {
        console.log('Users::create ' + data);
        app.users.add(data);
    });

    socket.on('articles::update', function(data) {
        var item = app.articles.find(function(item){
            return item.get('_id') === data._id;
        });

        if(!item){
            return;
        }

        item.set(data);
    });

    socket.on('articles::remove', function(data) {
        console.log('Socket on remove', data);
        app.articles.fetch();
    });
});

var socket = io.connect();