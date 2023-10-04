import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('historyStore', {
    state: () => ({ 
        moves_history: [],
    }),
  
    actions: {
        addMove(row,col,prevCol,prevRow,val,prev_val){
            if(prev_val.includes("t")){
                //Move logic
                this.moves_history.push(`${this.convertToChessNotation(row,col,val.split('-')[0],'move')}`);
            }else if(prev_val.split('-')[1] != val.split('-')[1]){
                //Take logic
                this.moves_history.push(`${this.convertToChessNotation(row,col,val.split('-')[0],'take')}`);
            }else{
                //Castling logic or promotion logic
            }
            console.log(this.moves_history);
        },
        convertToChessNotation(row,col,piece,op_type){
        // Create arrays for mapping row and column to chess notation
        const rows = ["1","2","3","4","5","6","7","8"];
        const cols = ["a","b","c","d","e","f","g","h"];

        // Get the row and column notation
        let rowNotation = rows[row];
        let colNotation = cols[col];

        if(op_type =='move'){
            return piece + colNotation + rowNotation;
        }
        if(op_type == 'take'){
            return piece + "x" + colNotation + rowNotation;
        }
        },
    }
  })