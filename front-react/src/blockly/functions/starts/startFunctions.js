
const start_btn = () => {
    console.log('시작버튼');
}

const start_with_q = () =>{
    console.log('q버튼');
}
window.start_btn = start_btn; // 전역 스코프에 함수 할당, new Function()이 전역에서 사용되어 함수 전달
window.start_with_q = start_with_q; // 전역 스코프에 함수 할당
export default {start_btn, start_with_q};