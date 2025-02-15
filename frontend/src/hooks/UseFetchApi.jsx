
const UseFetchApi = async ({route}) => {
    try {
        const response = await fetch(route);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error){
        console.log(error);
        return new Error(error.message);
    }
};

export default UseFetchApi;