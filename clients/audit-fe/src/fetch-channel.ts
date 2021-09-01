import axios from 'axios'

export const getChannelData = async (url:string):Promise<{link:string; channelLog:any; messageId:string}[]> => {
	const res = await axios.get(url);
	if (res.status !== 200) {
		console.error('didnt receive status 200 on get request!');
		return [];
	}
	const data = await res.data;
	
    return data
}