const { Client, MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');

const client = new Client();

client.on('qr', (qr) => {
    console.log('QR Code received, scan it!');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message) => {
    if (message.body.startsWith('!download ')) {
        const url = message.body.split(' ')[1];
        try {
            const videoUrl = await downloadInstagramVideo(url);
            const media = MessageMedia.fromFilePath(videoUrl);
            await client.sendMessage(message.from, media);
            console.log('Video sent successfully!');
        } catch (error) {
            console.error('Error downloading video:', error);
            await client.sendMessage(message.from, 'Failed to download the video. Please check the URL and try again.');
        }
    }
});

async function downloadInstagramVideo(url) {
    try {
        const response = await axios.get(`https://api.instagram.com/oembed?url=${url}`);
        const videoUrl = response.data.html.match(/src="([^"]+)"/)[1];
        const videoPath = `./downloads/${Date.now()}.mp4`;
        const videoResponse = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });
        videoResponse.data.pipe(fs.createWriteStream(videoPath));
        return videoPath;
    } catch (error) {
        throw new Error('Could not download video from Instagram: ' + error.message);
    }
}

client.initialize();
