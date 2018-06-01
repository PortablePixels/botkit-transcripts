
var path = require('path');
var express = require('express');

var transcript_schema = {
    user: {
        type: String,
        index: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    platform: {
      type: String,
    },
    message: {
        type: Object,
    },
    fromBot: {
        type: Boolean
    }
}

module.exports = function(botkit) {

    var plugin = {
        name: 'Transcripts',
        web: [{
                url: '/admin/transcripts',
                method: 'get',
                handler: function(req, res) {
                    var relativePath = path.relative(botkit.LIB_PATH + '/../views', __dirname + '/views');
                    res.render(relativePath + '/main');
                }
            },
            {
                    url: '/admin/transcripts/:uid',
                    method: 'get',
                    handler: function(req, res) {
                        var relativePath = path.relative(botkit.LIB_PATH + '/../views', __dirname + '/views');
                        res.render(relativePath + '/transcript');
                    }
            },
            {
                url: '/admin/api/transcripts',
                method: 'get',
                handler: function(req, res) {
                    // get a list of recently active transcripts
                    var query = botkit.db.transcripts.aggregate([{
                            $sort: {
                                created: -1,
                            }
                        },
                        {
                            $group: {
                                _id: "$user",
                                lastChat: {
                                    $first: "$created"
                                },
                                lastMessage: {
                                    $first: "$message"
                                }
                            },
                        },
                        {
                            $sort: {
                                lastChat: -1,
                            }
                        },
                    ]);

                    var offset = parseInt(req.query.offset) || 0;
                    var limit = parseInt(req.query.limit) || 50;

                    query.skip(offset);
                    query.limit(limit);

                    query.exec(function(err, results) {
                        res.json(results);
                    });
                }
            },
            {
                url: '/admin/api/transcripts/:uid',
                method: 'get',
                handler: function(req, res) {
                    var offset = parseInt(req.query.offset) || 0;
                    var limit = parseInt(req.query.limit) || 200;

                    var query = botkit.db.transcripts.find({
                        user: req.params.uid,
                    }).sort({
                        created: 1
                    });

                    query.skip(offset);
                    query.limit(limit);

                    query.exec(function(err, results) {
                        res.json(results);
                    });
                }
            }
        ],
        menu: [{
            title: 'Transcripts',
            url: '/admin/transcripts',
            icon: '💬',
        }],
        middleware: {
            understand: [
                function(bot, message, response, next) {
                    if (botkit.shouldEvaluate(message.type)) {
                        // todo: we might want this to happen EARLIER or LATER
                        var transcript = new botkit.db.transcripts();
                        transcript.user = message.user;
                        transcript.message = message;
                        transcript.fromBot = false;
                        transcript.platform = bot.type;
                        transcript.save();
                    }
                    next();
                }
            ],
            send: [
                function(bot, message, next) {

                    // todo: we might want this to happen EARLIER or LATER
                    var transcript = new botkit.db.transcripts();

                    transcript.user = message.to;
                    transcript.message = message;
                    transcript.fromBot = true;
                    transcript.platform = bot.type;
                    transcript.save();

                    next();
                }
            ]
        },
        init: function() {
            botkit.db.addModel(transcript_schema, 'transcript', 'transcripts');
            botkit.webserver.use("/plugins/transcripts", express.static(__dirname + "/public"));
        }
    }

    return plugin;
}
