import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('historyStore', {
    state: () => ({ 
        moves_history: [],
    }),
  
    actions: {
        addMove(row,col,prevRow,prevCol,val,prev_val,move_type){
            let notation = this.getAlgebraicCoordinates(prevRow,prevCol);
            let rowNotation = notation[0];
            let colNotation = notation[1];
            console.log(row,col,prevRow,prevCol,val,prev_val,move_type);
            if(prev_val.includes("t")){
                if(val.split('-')[0] == 'P'){
                    this.moves_history.push(`${this.convertToChessNotation(row,col,'','move')}`);
                }else{
                    this.moves_history.push(`${this.convertToChessNotation(row,col,val.split('-')[0],'move')}`);
                }
            }else if(prev_val.split('-')[1] != val.split('-')[1]){
                //Take logic
                if(val.split('-')[0] == 'P'){
                    this.moves_history.push(`${this.convertToChessNotation(row,col,colNotation,'take')}`);
                }else{
                    this.moves_history.push(`${this.convertToChessNotation(row,col,val.split('-')[0],'take')}`);
                }
            }else{
                //Castling logic or promotion logic
                if(move_type == 'castle king side'){
                    this.moves_history.push(`O-O`);
                }else if(move_type == 'castle queen side'){
                    this.moves_history.push(`O-O-O`);
                }else{

                }
            }
            console.log("History ",this.moves_history);
        },
        convertToChessNotation(row,col,piece,op_type){
        // Create arrays for mapping row and column to chess notation
        let notation = this.getAlgebraicCoordinates(row,col);
        let rowNotation = notation[0];
        let colNotation = notation[1];

        if(op_type =='move'){
            return piece + colNotation + rowNotation;
        }
        if(op_type == 'take'){
            return piece + "x" + colNotation + rowNotation;
        }
        },
        convertToMatrixNotation(notation){
            // Split notation into piece, column, and row
            const piece = notation.substring(0,1);
            const colNotation = notation.substring(1,2);
            const rowNotation = notation.substring(2,3);

            // Get column index from cols array
            const cols = ["a","b","c","d","e","f","g","h"];
            const col = cols.indexOf(colNotation);

            // Get row index from rows array 
            const rows = ["1","2","3","4","5","6","7","8"];
            const row = rows.indexOf(rowNotation);

            // Return row and column
            return [row,col];

        },
        getAlgebraicCoordinates(row,col){
            const rows = ["1","2","3","4","5","6","7","8"];
            const cols = ["a","b","c","d","e","f","g","h"];

            // Get the row and column notation
            let rowNotation = rows[row];
            let colNotation = cols[col];

            return [rowNotation,colNotation];
        }
    }
  })