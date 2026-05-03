function getFileName(file) {
    const filepath = file.path;  //uploads\\productos\\se60-HwcG2qSy11xvvnxMoVh.png
    const fileSplit = filepath.split('\\'); // ['uploads', 'productos', 'se60-HwcG2qSy11xvvnxMoVh.png']
                                    // posicion     0         1                2
    return `${fileSplit[1]}/${fileSplit[2]}`; // productos/se60-HwcG2qSy11xvvnxMoVh.png
}

module.exports = {
    getFileName
};