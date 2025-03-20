try {
  const storedTimeline = JSON.parse(localStorage.getItem('timeline'));
  if (storedTimeline) {
    // Ensure numeric values are properly converted
    storedTimeline[0].barHeight = parseFloat(storedTimeline[0].barHeight) || 0.5;
    storedTimeline[0].barWidth = parseInt(storedTimeline[0].barWidth) || 4;
    storedTimeline[0].barGap = parseInt(storedTimeline[0].barGap) || 2;
    storedTimeline[0].cursorWidth = parseInt(storedTimeline[0].cursorWidth) || 0;
    window.timeline = storedTimeline;
  } else {
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
} catch (error) {
  console.error('Error loading timeline from localStorage:', error);
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
