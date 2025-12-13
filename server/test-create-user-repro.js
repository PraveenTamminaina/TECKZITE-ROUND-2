const createUser = async () => {
    try {
        const randomId = 'TZ-' + Math.floor(1000 + Math.random() * 9000);
        const payload = {
            teckziteId: randomId,
            name: 'Test User',
            mobileNumber: '9999999999'
        };
        console.log('Sending payload:', payload);

        // Using port 5001 as found in .env
        const response = await fetch('http://127.0.0.1:5001/api/admin/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error Response:', response.status, data);
        } else {
            console.log('Success:', data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

createUser();
