function timeout(ms) {
	console.log('timeout');
    return new Promise(resolve => setTimeout(resolve, ms));
}
const sleep = async function() {
    console.log('sleep');
    await timeout(3000);
    console.log('sleep apos 3seg');    
}

sleep();