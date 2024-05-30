const fs = require('fs');
const path = require('path');

class SparseMatrix {
    constructor(numRows = 0, numCols = 0) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.elements = new Map();
    }

    loadFromFile(filePath) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.trim().split('\n');
        this.numRows = parseInt(lines[0].split('=')[1].trim());
        this.numCols = parseInt(lines[1].split('=')[1].trim());

        lines.slice(2).forEach(line => {
            const [row, col, val] = line.slice(1, -1).split(',').map(Number);
            this.elements.set(`${row},${col}`, val);
        });
    }

    getElement(row, col) {
        return this.elements.get(`${row},${col}`) || 0;
    }

    setElement(row, col, value) {
        if (value !== 0) {
            this.elements.set(`${row},${col}`, value);
        } else {
            this.elements.delete(`${row},${col}`);
        }
    }

    add(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error("Matrix dimensions must match for addition.");
        }
        const result = new SparseMatrix(this.numRows, this.numCols);
        new Set([...this.elements.keys(), ...other.elements.keys()]).forEach(key => {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, this.getElement(row, col) + other.getElement(row, col));
        });
        return result;
    }

    subtract(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error("Matrix dimensions must match for subtraction.");
        }
        const result = new SparseMatrix(this.numRows, this.numCols);
        new Set([...this.elements.keys(), ...other.elements.keys()]).forEach(key => {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, this.getElement(row, col) - other.getElement(row, col));
        });
        return result;
    }

    multiply(other) {
        if (this.numCols !== other.numRows) {
            throw new Error("Number of columns of the first matrix must equal number of rows of the second matrix.");
        }
        const result = new SparseMatrix(this.numRows, other.numCols);
        this.elements.forEach((val, key) => {
            const [i, j] = key.split(',').map(Number);
            for (let k = 0; k < other.numCols; k++) {
                result.setElement(i, k, result.getElement(i, k) + val * other.getElement(j, k));
            }
        });
        return result;
    }

    saveToFile(filePath) {
        const lines = [`rows=${this.numRows}`, `cols=${this.numCols}`];
        this.elements.forEach((val, key) => {
            lines.push(`(${key}, ${val})`);
        });
        fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    }
}

function main() {
    const inputDir = path.join(require('os').homedir(), 'dsa', 'sparse_matrix', 'sample_inputs');

    let matrixFiles;
    try {
        matrixFiles = fs.readdirSync(inputDir).filter(fname => fname.endsWith('.txt'));
    } catch (e) {
        console.error(`Error: ${e.message}`);
        return;
    }

    console.log("Select operation:");
    console.log("1. Addition");
    console.log("2. Subtraction");
    console.log("3. Multiplication");

    const operation = parseInt(prompt("Enter operation number: "));

    const firstMatrixIndex = parseInt(prompt("Enter first matrix file index: "));
    const secondMatrixIndex = parseInt(prompt("Enter second matrix file index: "));
    const outputFileName = prompt("Enter output file name: ");

    const matrix1 = new SparseMatrix();
    matrix1.loadFromFile(path.join(inputDir, matrixFiles[firstMatrixIndex]));
    console.log(`First matrix dimensions: ${matrix1.numRows}x${matrix1.numCols}`);

    const matrix2 = new SparseMatrix();
    matrix2.loadFromFile(path.join(inputDir, matrixFiles[secondMatrixIndex]));
    console.log(`Second matrix dimensions: ${matrix2.numRows}x${matrix2.numCols}`);

    let resultMatrix;
    try {
        if (operation === 1) {
            resultMatrix = matrix1.add(matrix2);
        } else if (operation === 2) {
            resultMatrix = matrix1.subtract(matrix2);
        } else if (operation === 3) {
            resultMatrix = matrix1.multiply(matrix2);
        } else {
            console.error("Invalid operation selected.");
            return;
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
        return;
    }

    const outputDir = path.join(require('os').homedir(), 'dsa', 'sparse_matrix', 'output');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputFilePath = path.join(outputDir, outputFileName);
    resultMatrix.saveToFile(outputFilePath);
    console.log(`Result saved to ${outputFilePath}`);
}

main();
