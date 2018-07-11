let baseUrl = 'https://ssapi.shipstation.com',
    apiKey = 'b4d9703b81a74afba64feba245f5a1c3',
    apiSecret = '1e8cdb55b0ea488aad791ff1d5722c8a';

let request = new XMLHttpRequest();

request.open('GET', `${baseUrl}/orders/listbytag?orderStatus=shipped&page=1&pageSize=100`);

request.setRequestHeader('Authorization', `Basic ${btoa(`${apiKey}:${apiSecret}`)}`);

request.onreadystatechange = function () {
    if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.response);
    }
};

request.send();