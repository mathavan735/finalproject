export const drawDetections = (predictions, ctx) => {
  // Set default styles
  ctx.lineWidth = 2;
  ctx.font = '16px Arial';
  ctx.textBaseline = 'top';

  predictions.forEach(prediction => {
    // Get prediction results
    const [x, y, width, height] = prediction.bbox;
    const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;

    // Choose color based on confidence
    const confidence = prediction.score;
    let color;
    if (confidence > 0.8) {
      color = '#00FF00'; // High confidence - green
    } else if (confidence > 0.6) {
      color = '#FFA500'; // Medium confidence - orange
    } else {
      color = '#FF0000'; // Low confidence - red
    }

    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();

    // Add shadow to text for better visibility
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw label background
    const textWidth = ctx.measureText(text).width;
    const textHeight = parseInt(ctx.font, 10);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - 1, y - textHeight - 4, textWidth + 8, textHeight + 4);
    ctx.globalAlpha = 1;

    // Draw label text
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x + 3, y - textHeight - 2);

    // Reset shadow
    ctx.shadowColor = 'transparent';
  });
};