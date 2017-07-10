// By the Stream by Paul Laurence Dunbar, 1872 - 1906
// https://www.poets.org/poetsorg/poem/stream
var words = "By the stream I dream in calm delight, and watch as in a glass, How the clouds like crowds of snowy-hued and white-robed maidens pass, And the water into ripples breaks and sparkles as it spreads, Like a host of armored knights with silver helmets on their heads. And I deem the stream an emblem fit of human life may go, For I find a mind may sparkle much and yet but shallows show, And a soul may glow with myriad lights and wondrous mysteries, When it only lies a dormant thing and mirrors what it sees.".split(' ');

// writeable callback function performs expensive opperation - post to API
let writeable = Stream.writeable(function(data){
  console.log('Saving data.', Date.now());
  console.time('serverLatency');
  $.ajax('http://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    data: data
  }).then(function(result) {
    console.timeEnd('serverLatency');
    console.log('Server Response', result);
  });
});

writeable.cork();
addToStreamAfterRandomInterval(); // infinite recursion for life of page

setInterval(function(){
  writeable.uncork();
  setTimeout(writeable.cork);
}, 10 * 1000) // every 10 seconds;

function addToStreamAfterRandomInterval() {
  var start = random(words.length);
  var length = random(words.length - start);
  var delay = random(2 * 1000) // more than every 2 seconds;

  var fragment = words.slice(start, length);
  console.log(Date.now(), 'adding fragment to stream', fragment);
  console.log('delaying by', delay, 'ms')

  writeable.write(fragment);

  setTimeout(addToStreamAfterRandomInterval, delay);

  function random(gamut) {
    return Math.floor(Math.random() * gamut);
  }
}
