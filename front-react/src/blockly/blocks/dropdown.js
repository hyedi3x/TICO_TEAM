import { imgArr } from "./blockGenerator";

// 복제본 만들기 dropdown 값 동적으로 반환
export const getCloneDropdown = () => {
    const dropdown = [["나", "self"]];

    if (!imgArr || !imgArr.current) return dropdown;

    imgArr.current.forEach((_, idx) => {
        dropdown.push([`${idx + 1}번째 오브젝트`, idx.toString()]);
    });

    return dropdown;
};

// 충돌 처리 dropdown 값 동적으로 반환
export const getTouchDropdown = () => {
    const dropdown = [["마우스 포인터", "mouse"],["벽", "wall"]];
    const allObjects = [...imgArr.current, ...(window.cloneArr || [])];

    if(!allObjects) return dropdown;

    allObjects.forEach((_, idx) => {
        dropdown.push([`${idx + 1}번째 오브젝트`, idx.toString()]);
    });

    return dropdown;
};