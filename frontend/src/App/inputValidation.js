
export const emailValidation = (input) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (typeof(input) !== String){
        throw new Error('Please enter valid type of input.');
    } else if (input.length > 10){
        throw new Error('Your input is too long.');
    } else if (!input.toLowerCase().match(emailPattern)){
        throw new Error('Please enter a valid email address.')
    }
};

export const numberValidation = (input) => {
    console.log('validating number');
    const numberPattern = /^[0-9]*$/;

    if (!numberPattern.test(input)){
        // Check pattern
        throw new Error('Please enter a valid game ID.');
    }
};

export const textValidation = (input) => {
    const textPattern = /^[a-zA-Z0-9_.-]*$/;

    if (typeof(input) !== String){
        throw new Error('Please enter valid type of input.');
    } else if (input.length > 10){
        throw new Error('Your input is too long.');
    } else if (!input.match(textPattern)){
        throw new Error('Please enter a valid input.')
    }
}
