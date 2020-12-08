import React from 'react';

const Headline = () => {

return (
        <div className="headline-main" onClick={() => {window.location.href="http://davidvendel.com"}}>
            <div className="headline-neon">
                <span className="headline-text" data-text="">davidvendel.com</span>
                <span className="headline-gradient"></span>
                <span className="headline-spotlight"></span>
            </div>
        </div>
    )
}

export default Headline