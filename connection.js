var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: [
    //'127.0.0.1:9200/',
    //'127.0.0.1:9300/'
    'search-smartcamsonelastic-pknjbnt5zydbsv7eswizna5kju.us-west-2.es.amazonaws.com',
    'search-smartcamsonelastic-pknjbnt5zydbsv7eswizna5kju.us-west-2.es.amazonaws.com/_plugin/kibana/'

  ]
});

module.exports = client;
