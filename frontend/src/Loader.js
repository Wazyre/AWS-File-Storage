import './Loader.css'

const Loader = ({ size }) => {
    if (size === "big") {
        return (
            <div className='loader' />
        )
    }

    return (
        <div className='smallLoader' />
    )
};

export default Loader;
