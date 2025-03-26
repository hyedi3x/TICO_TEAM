import noticeImage from '../imgs/temporaryImgs/공지사항.png';

const Notice = () => {
    return(
        <div style={{display: 'flex', justifyContent:'center'}}>
            <img src={noticeImage}/>
        </div>
    )
    
};
export default Notice;