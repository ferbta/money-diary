export const numberToVietnameseWords = (number: number): string => {
    if (number === 0) return "Không đồng";

    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const unitsTen = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    const powers = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

    const readThreeDigits = (n: number, isFirstGroup: boolean): string => {
        let res = "";
        const hundred = Math.floor(n / 100);
        const ten = Math.floor((n % 100) / 10);
        const unit = n % 10;

        if (hundred > 0 || !isFirstGroup) {
            res += units[hundred] + " trăm ";
        }

        if (ten > 0) {
            if (ten === 1) res += "mười ";
            else res += units[ten] + " mươi ";
        } else if (hundred > 0 && unit > 0) {
            res += "lẻ ";
        }

        if (unit > 0) {
            if (unit === 1 && ten > 1) res += "mốt";
            else if (unit === 5 && ten > 0) res += "lăm";
            else res += units[unit];
        }

        return res.trim();
    };

    let res = "";
    let groupIdx = 0;
    let tempNumber = Math.abs(number);

    while (tempNumber > 0) {
        const group = tempNumber % 1000;
        if (group > 0) {
            const groupWords = readThreeDigits(group, tempNumber < 1000);
            res = groupWords + " " + powers[groupIdx] + " " + res;
        }
        tempNumber = Math.floor(tempNumber / 1000);
        groupIdx++;
    }

    res = res.trim();
    if (number < 0) res = "Âm " + res;

    // Capitalize first letter and add "đồng"
    return res.charAt(0).toUpperCase() + res.slice(1) + " đồng";
};
