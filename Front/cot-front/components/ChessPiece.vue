<template>
    <font-awesome-icon :icon="chessboard_to_icon_text(icon)" />
</template>

<script>
import { icon, library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChessPawn as blackPawn, faChessRook as blackRook, faChessBishop as blackBishop, faChessKnight as blackKnight, faChessQueen as blackQueen, faChessKing as blackKing} from '@fortawesome/free-solid-svg-icons';
import { faChessPawn as whitePawn, faChessRook as whiteRook, faChessBishop as whiteBishop, faChessKnight as whiteKnight, faChessQueen as whiteQueen, faChessKing as whiteKing} from '@fortawesome/free-regular-svg-icons';

library.add(blackPawn,whitePawn,blackRook,whiteRook,blackBishop,whiteBishop,blackKnight,whiteKnight,blackQueen,whiteQueen,blackKing,whiteKing);
// config.autoAddCss = false

export default {
    name: 'ChessPiece',
    components: {
        FontAwesomeIcon,
    },
    props: {
        icon: {
        type: String,
        required: true,
        },
    },
    methods: {    
        chessboard_to_icon_text(text_chessboard){
            let icon_text = "";
            
            if(text_chessboard.includes('b')) icon_text+='fa-solid';
            if(text_chessboard.includes('w')) icon_text+='fa-regular';

            icon_text+=" ";

            if(text_chessboard.includes('P')) icon_text+='fa-chess-pawn';
            if(text_chessboard.includes('R')) icon_text+='fa-chess-rook';
            if(text_chessboard.includes('B')) icon_text+='fa-chess-bishop';
            if(text_chessboard.includes('N')) icon_text+='fa-chess-knight';
            if(text_chessboard.includes('Q')) icon_text+='fa-chess-queen';
            if(text_chessboard.includes('K')) icon_text+='fa-chess-king';

            return icon_text;
        },
    },
};
</script>