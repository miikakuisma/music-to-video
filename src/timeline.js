
try {
  window.timeline = JSON.parse(localStorage.getItem('timeline'));
} catch (error) {
  window.timeline = [
    {
      time: 0,
      backgroundImage: null,
      backgroundColor: '#000000',
      backgroundScale: 'cover',
      backgroundCustomScale: 100,
      backgroundPosition: 'center',
      backgroundPositionX: 50,
      backgroundPositionY: 50,
      shadowEnabled: true,
      waveformColor: '#999999',
      progressColor: '#ffffff',
      cursorColor: '#ffffff', // TO DO: add to editor
      barWidth: 4,
      barHeight: 0.5,
      barGap: 2,
      cursorWidth: 0,
      barAlign: 'center',
      text: {
        songTitle: 'Song Title',
        artistName: 'Artist Name',
        font: 'Arial',
        fontSize: 30,
        color: '#000000',
        align: 'top-center',
        offsetX: 0,
        offsetY: 0,
      }
    },
  ]
}

window.updateTimeline = function(newTimeline) {
  window.timeline = newTimeline;
  localStorage.setItem('timeline', JSON.stringify(newTimeline));
}

window.onbeforeunload = function() {
  updateTimeline(window.timeline);
}
