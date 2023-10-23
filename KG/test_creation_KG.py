from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS

ontology_url = "http://example.com/chess_ontology_example#"
# Define your ontology namespace
ont = Namespace(ontology_url)

# Create a new RDF graph
g = Graph()

# Define classes and properties
game = ont.Game
turn = ont.Turn
piece = ont.Piece
position = ont.Position
piece_type = ont.PieceType
action = ont.Action


# Define relationships
has_turn = ont.hasTurn
has_pieces = ont.hasPieces
has_action = ont.hasAction
next_turn = ont.hasNextTurn
has_position = ont.hasPosition
has_next_position = ont.hasNextPosition
has_piece_type = ont.hasPieceType

# Create instances
game_instance = URIRef(f"{ontology_url}game_1")
turn_instance = URIRef(f"{ontology_url}turn_1")
piece_instance = URIRef(f"{ontology_url}piece_1")
position_instance = URIRef(f"{ontology_url}position_1")
action_instance = URIRef(f"{ontology_url}action_1")

# Add triples to the graph
g.add((game_instance, RDF.type, game))
g.add((game_instance, has_turn, turn_instance))

g.add((turn_instance, RDF.type, turn))
g.add((turn_instance, has_pieces, piece_instance))
g.add((turn_instance, has_action, action_instance))
g.add((turn_instance, next_turn, turn_instance))  # Assuming a circular next Turn relation

g.add((piece_instance, RDF.type, piece))
g.add((piece_instance, has_position, position_instance))
g.add((piece_instance, has_next_position, position_instance))  # Assuming possible next Position

g.add((position_instance, RDF.type, position))

g.add((action_instance, RDF.type, action))

# Serialize the graph to a file
g.serialize("chess_ontology.rdf", format="xml")
