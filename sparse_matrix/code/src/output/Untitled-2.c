#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int row, col;
    int value;
} SparseElement;

typedef struct {
    int numRows, numCols;
    int numElements;
    SparseElement* elements;
} SparseMatrix;

void createEmptyMatrix(SparseMatrix* matrix, int numRows, int numCols) {
    matrix->numRows = numRows;
    matrix->numCols = numCols;
    matrix->numElements = 0;
    matrix->elements = NULL;
}

void destroyMatrix(SparseMatrix* matrix) {
    free(matrix->elements);
    matrix->elements = NULL;
}

void loadFromFile(SparseMatrix* matrix, const char* filePath) {
    FILE* file = fopen(filePath, "r");
    if (!file) {
        printf("Error: Unable to open file.\n");
        return;
    }

    char line[100];
    fgets(line, sizeof(line), file);
    sscanf(line, "rows=%d\n", &(matrix->numRows));
    fgets(line, sizeof(line), file);
    sscanf(line, "cols=%d\n", &(matrix->numCols));

    matrix->numElements = 0;
    while (fgets(line, sizeof(line), file)) {
        if (line[0] == '\n') break;

        SparseElement element;
        sscanf(line, "(%d, %d, %d)\n", &(element.row), &(element.col), &(element.value));
        addElement(matrix, element);
    }

    fclose(file);
}

void addElement(SparseMatrix* matrix, SparseElement element) {
    matrix->elements = (SparseElement*) realloc(matrix->elements, sizeof(SparseElement) * (matrix->numElements + 1));
    matrix->elements[matrix->numElements++] = element;
}

int getElement(SparseMatrix* matrix, int row, int col) {
    for (int i = 0; i < matrix->numElements; i++) {
        if (matrix->elements[i].row == row && matrix->elements[i].col == col) {
            return matrix->elements[i].value;
        }
    }
    return 0;
}

void setElement(SparseMatrix* matrix, int row, int col, int value) {
    if (value != 0) {
        for (int i = 0; i < matrix->numElements; i++) {
            if (matrix->elements[i].row == row && matrix->elements[i].col == col) {
                matrix->elements[i].value = value;
                return;
            }
        }
        addElement(matrix, (SparseElement) {row, col, value});
    } else {
        for (int i = 0; i < matrix->numElements; i++) {
            if (matrix->elements[i].row == row && matrix->elements[i].col == col) {
                for (int j = i; j < matrix->numElements - 1; j++) {
                    matrix->elements[j] = matrix->elements[j + 1];
                }
                matrix->numElements--;
                break;
            }
        }
    }
}

SparseMatrix addMatrices(SparseMatrix* matrix1, SparseMatrix* matrix2) {
    if (matrix1->numRows != matrix2->numRows || matrix1->numCols != matrix2->numCols) {
        printf("Error: Matrix dimensions must match for addition.\n");
        exit(1);
    }

    SparseMatrix result;
    createEmptyMatrix(&result, matrix1->numRows, matrix1->numCols);

    for (int i = 0; i < matrix1->numElements; i++) {
        int row = matrix1->elements[i].row;
        int col = matrix1->elements[i].col;
        int value = matrix1->elements[i].value;

        result.