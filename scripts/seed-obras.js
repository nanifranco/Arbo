const { createClient } = require('@supabase/supabase-js');
 
const supabaseUrl = 'https://zowlyqpcarsxaosknmna.supabase.co';
const supabaseKey = 'sb_publishable_0JY6JlXOp8O73rYF7Ey5Tw_q7jyX1Mn';
const supabase = createClient(supabaseUrl, supabaseKey);
 
const obras = [
  // MUSICALES INTERNACIONALES
  { titulo: "Hamilton", sinopsis: "La vida del Padre Fundador Alexander Hamilton narrada a través de hip-hop, jazz y R&B. Una obra sobre ambición, legado y los ideales de una nación.", genero: "Musical", pais: "Estados Unidos", director: "Thomas Kail", anio: 2015 },
  { titulo: "Chicago", sinopsis: "En el Chicago de los años 20, Roxie Hart asesina a su amante y, junto a Velma Kelly, busca fama y absolución en un juicio convertido en espectáculo.", genero: "Musical", pais: "Estados Unidos", director: "Bob Fosse", anio: 1975 },
  { titulo: "El Fantasma de la Ópera", sinopsis: "Un genio musical desfigurado vive bajo la Ópera de París y se obsesiona con una joven soprano, su musa y protegida.", genero: "Musical", pais: "Reino Unido", director: "Harold Prince", anio: 1986 },
  { titulo: "Les Misérables", sinopsis: "Jean Valjean busca redención en la Francia del siglo XIX mientras es perseguido implacablemente por el inspector Javert.", genero: "Musical", pais: "Reino Unido", director: "Trevor Nunn", anio: 1985 },
  { titulo: "Little Shop of Horrors", sinopsis: "Seymour, un florista tímido, descubre una planta carnívora de origen extraterrestre que le promete fama y amor a cambio de sangre humana.", genero: "Musical", pais: "Estados Unidos", director: "Howard Ashman", anio: 1982 },
  { titulo: "El Rey León", sinopsis: "Simba, un cachorro de león, huye tras la muerte de su padre y debe encontrar el valor de regresar y reclamar su lugar como rey.", genero: "Musical", pais: "Estados Unidos", director: "Julie Taymor", anio: 1997 },
  { titulo: "Cats", sinopsis: "Una noche al año, los gatos Jellicle se reúnen para elegir cuál de ellos asciende al Cielo Heaviside y comienza una nueva vida.", genero: "Musical", pais: "Reino Unido", director: "Trevor Nunn", anio: 1981 },
  { titulo: "Rent", sinopsis: "Un grupo de artistas jóvenes lucha por sobrevivir y crear en el East Village de Nueva York en plena crisis del SIDA.", genero: "Musical", pais: "Estados Unidos", director: "Michael Greif", anio: 1996 },
  { titulo: "West Side Story", sinopsis: "Una historia de amor imposible entre jóvenes de bandas rivales en el Nueva York de los años 50, reinterpretando Romeo y Julieta.", genero: "Musical", pais: "Estados Unidos", director: "Jerome Robbins", anio: 1957 },
  { titulo: "A Chorus Line", sinopsis: "Diecisiete bailarines audicionan para conseguir uno de ocho lugares en un musical de Broadway, revelando sus sueños y miedos.", genero: "Musical", pais: "Estados Unidos", director: "Michael Bennett", anio: 1975 },
  { titulo: "Sweeney Todd", sinopsis: "Un barbero de Londres regresa de la deportación injusta para vengarse de quienes destruyeron su vida, con consecuencias sangrientas.", genero: "Musical", pais: "Estados Unidos", director: "Harold Prince", anio: 1979 },
  { titulo: "Into the Woods", sinopsis: "Los cuentos de hadas se entrelazan cuando un panadero y su esposa emprenden un viaje mágico para romper la maldición que los hace estériles.", genero: "Musical", pais: "Estados Unidos", director: "James Lapine", anio: 1987 },
  { titulo: "Wicked", sinopsis: "La historia no contada de las brujas de Oz: cómo Elphaba, la futura Bruja Mala del Oeste, y Glinda pasaron de ser rivales a mejores amigas.", genero: "Musical", pais: "Estados Unidos", director: "Joe Mantello", anio: 2003 },
  { titulo: "Cabaret", sinopsis: "En el Berlín de 1931, la vida nocturna del Kit Kat Klub contrasta con el ascenso del nazismo mientras una cantante y un escritor americano viven su amor.", genero: "Musical", pais: "Estados Unidos", director: "Harold Prince", anio: 1966 },
  { titulo: "Grease", sinopsis: "Sandy y Danny viven un romance de verano que se complica cuando se reencuentran en la preparatoria, donde las pandillas y las expectativas los separan.", genero: "Musical", pais: "Estados Unidos", director: "Tom Moore", anio: 1971 },
  { titulo: "The Sound of Music", sinopsis: "Una novicia se convierte en institutriz de los siete hijos del Capitán Von Trapp en la Austria previa a la Segunda Guerra Mundial.", genero: "Musical", pais: "Estados Unidos", director: "Vincent J. Donehue", anio: 1959 },
  { titulo: "Hair", sinopsis: "Una tribu de hippies en Nueva York vive el amor libre y la contracultura mientras uno de ellos debe decidir si acatar el llamado al servicio militar en Vietnam.", genero: "Musical", pais: "Estados Unidos", director: "Tom O'Horgan", anio: 1967 },
  { titulo: "La Cage aux Folles", sinopsis: "Un cantante drag y su pareja administran un club nocturno en Saint-Tropez. Cuando el hijo anuncia su boda con la hija de un político conservador, la familia debe fingir normalidad.", genero: "Musical", pais: "Estados Unidos", director: "Arthur Laurents", anio: 1983 },
  { titulo: "Fun Home", sinopsis: "Alison Bechdel regresa a su infancia para entender a su padre, un hombre conflictuado con su identidad sexual que murió en circunstancias misteriosas.", genero: "Musical", pais: "Estados Unidos", director: "Sam Gold", anio: 2013 },
  { titulo: "Spring Awakening", sinopsis: "En la Alemania del siglo XIX, adolescentes reprimen su sexualidad y sus deseos con consecuencias devastadoras.", genero: "Musical", pais: "Estados Unidos", director: "Michael Greif", anio: 2006 },
 
  // TEATRO CLÁSICO UNIVERSAL
  { titulo: "Hamlet", sinopsis: "El príncipe de Dinamarca sospecha que su tío asesinó a su padre para tomar el trono y casarse con su madre. La venganza lo consume.", genero: "Tragedia", pais: "Reino Unido", director: "William Shakespeare", anio: 1603 },
  { titulo: "Romeo y Julieta", sinopsis: "Dos jóvenes de familias enemigas en Verona se enamoran y su amor imposible termina en tragedia.", genero: "Tragedia", pais: "Reino Unido", director: "William Shakespeare", anio: 1597 },
  { titulo: "Macbeth", sinopsis: "Un general escocés, impulsado por su ambición y las profecías de tres brujas, asesina al rey para tomar el trono con consecuencias devastadoras.", genero: "Tragedia", pais: "Reino Unido", director: "William Shakespeare", anio: 1606 },
  { titulo: "El sueño de una noche de verano", sinopsis: "En un bosque mágico, cuatro enamorados, una compañía de actores aficionados y las hadas del rey Oberón se enredan en confusiones cómicas.", genero: "Comedia", pais: "Reino Unido", director: "William Shakespeare", anio: 1595 },
  { titulo: "Edipo Rey", sinopsis: "El rey de Tebas investiga el asesinato de su predecesor sin saber que él mismo es el culpable y que su vida es la más oscura de las tragedias.", genero: "Tragedia", pais: "Grecia", director: "Sófocles", anio: -429 },
  { titulo: "Antígona", sinopsis: "Antígona desafía el decreto del rey Creonte para dar sepultura a su hermano muerto, eligiendo la ley divina sobre la ley humana.", genero: "Tragedia", pais: "Grecia", director: "Sófocles", anio: -441 },
  { titulo: "Las nubes", sinopsis: "Aristófanes satiriza a los sofistas y a Sócrates a través de un campesino ateniense que busca que su hijo aprenda a hacer trampas para evitar sus deudas.", genero: "Comedia", pais: "Grecia", director: "Aristófanes", anio: -423 },
  { titulo: "El avaro", sinopsis: "Harpagón, un viejo tacaño, pone su amor al dinero por encima de todo, incluso de la felicidad de sus propios hijos.", genero: "Comedia", pais: "Francia", director: "Molière", anio: 1668 },
  { titulo: "El médico a palos", sinopsis: "Sganarelle, un leñador borracho, es confundido con un médico y debe seguir el juego para tratar a una joven que finge estar muda.", genero: "Comedia", pais: "Francia", director: "Molière", anio: 1666 },
  { titulo: "Tartufo", sinopsis: "Un hipócrita religioso se infiltra en una familia burguesa y la manipula hasta casi destruirla.", genero: "Comedia", pais: "Francia", director: "Molière", anio: 1664 },
  { titulo: "La gaviota", sinopsis: "En una finca rusa, el amor no correspondido, la ambición artística y el paso del tiempo destruyen las ilusiones de sus personajes.", genero: "Drama", pais: "Rusia", director: "Konstantín Stanislavski", anio: 1898 },
  { titulo: "El jardín de los cerezos", sinopsis: "Una familia aristocrática rusa regresa a su hacienda para intentar salvarla de la subasta, sin poder aceptar que su mundo ha terminado.", genero: "Drama", pais: "Rusia", director: "Konstantín Stanislavski", anio: 1904 },
  { titulo: "Tres hermanas", sinopsis: "Tres hermanas y su hermano viven en una ciudad provincial rusa soñando con regresar a Moscú, mientras la vida pasa sin que nada cambie.", genero: "Drama", pais: "Rusia", director: "Konstantín Stanislavski", anio: 1901 },
  { titulo: "Casa de muñecas", sinopsis: "Nora Helmer descubre que su matrimonio perfecto es una ilusión y toma la decisión radical de abandonarlo todo para encontrarse a sí misma.", genero: "Drama", pais: "Noruega", director: "Henrik Ibsen", anio: 1879 },
  { titulo: "Hedda Gabler", sinopsis: "Una mujer inteligente y manipuladora, atrapada en un matrimonio que la asfixia, busca controlar el destino de quienes la rodean.", genero: "Drama", pais: "Noruega", director: "Henrik Ibsen", anio: 1891 },
 
  // TEATRO DEL SIGLO XX
  { titulo: "Esperando a Godot", sinopsis: "Vladimir y Estragón esperan junto a un árbol a alguien llamado Godot que nunca llega. Una meditación sobre el tiempo, la esperanza y la condición humana.", genero: "Absurdismo", pais: "Francia", director: "Roger Blin", anio: 1953 },
  { titulo: "La cantante calva", sinopsis: "Dos parejas burguesas sostienen conversaciones sin sentido que revelan el vacío de la comunicación humana y la absurdidad de la vida cotidiana.", genero: "Absurdismo", pais: "Francia", director: "Nicolas Bataille", anio: 1950 },
  { titulo: "Muerte de un viajante", sinopsis: "Willy Loman, un vendedor al final de su carrera, colapsa bajo el peso del sueño americano y su incapacidad de alcanzarlo.", genero: "Drama", pais: "Estados Unidos", director: "Elia Kazan", anio: 1949 },
  { titulo: "Un tranvía llamado deseo", sinopsis: "Blanche DuBois llega a Nueva Orleans a casa de su hermana y su cuñado Stanley Kowalski. El choque entre ilusión y brutalidad acaba en tragedia.", genero: "Drama", pais: "Estados Unidos", director: "Elia Kazan", anio: 1947 },
  { titulo: "¿Quién le teme a Virginia Woolf?", sinopsis: "Una noche, un matrimonio universitario invita a una pareja joven a su casa. Lo que sigue es una guerra psicológica devastadora.", genero: "Drama", pais: "Estados Unidos", director: "Alan Schneider", anio: 1962 },
  { titulo: "El zoo de cristal", sinopsis: "Tom recuerda a su madre y su hermana Laura, una joven frágil que vive refugiada en su colección de animales de cristal.", genero: "Drama", pais: "Estados Unidos", director: "Eddie Dowling", anio: 1944 },
  { titulo: "Largo viaje del día hacia la noche", sinopsis: "Durante un día de verano, la familia Tyrone enfrenta sus adicciones, sus fracasos y los fantasmas que los mantienen atrapados entre sí.", genero: "Drama", pais: "Estados Unidos", director: "José Quintero", anio: 1956 },
  { titulo: "Seis personajes en busca de autor", sinopsis: "Seis personajes irrumpen en un ensayo teatral exigiendo que se cuente su historia, borrando los límites entre realidad y ficción.", genero: "Drama experimental", pais: "Italia", director: "Luigi Pirandello", anio: 1921 },
  { titulo: "La ópera de tres centavos", sinopsis: "Macheath, el bandido más elegante de Londres, enfrenta la traición, el amor y la horca en una sátira feroz de la sociedad burguesa.", genero: "Drama musical", pais: "Alemania", director: "Erich Engel", anio: 1928 },
  { titulo: "Madre Coraje y sus hijos", sinopsis: "Durante la Guerra de los Treinta Años, una mujer arrastra su carreta de mercancías con sus tres hijos. La guerra le quitará a todos.", genero: "Drama épico", pais: "Alemania", director: "Bertolt Brecht", anio: 1941 },
  { titulo: "Las criadas", sinopsis: "Dos hermanas que trabajan como sirvientas representan rituales de humillación y poder, soñando con asesinar a su patrona.", genero: "Drama", pais: "Francia", director: "Louis Jouvet", anio: 1947 },
  { titulo: "En attendant Godot", sinopsis: "Dos vagabundos esperan bajo un árbol a alguien llamado Godot que nunca llega, en la versión original en francés de Beckett.", genero: "Absurdismo", pais: "Francia", director: "Roger Blin", anio: 1952 },
  { titulo: "Equus", sinopsis: "Un psiquiatra investiga por qué un joven cegó a seis caballos, y en el proceso cuestiona sus propias certezas sobre normalidad y pasión.", genero: "Drama", pais: "Reino Unido", director: "John Dexter", anio: 1973 },
  { titulo: "Amadeus", sinopsis: "Antonio Salieri, consumido por los celos, narra su obsesión con destruir a Mozart, a quien considera elegido por Dios y al que odia con devoción.", genero: "Drama", pais: "Reino Unido", director: "Peter Hall", anio: 1979 },
  { titulo: "Angels in America", sinopsis: "En el Nueva York de los años 80, varias historias se entrelazan alrededor de la crisis del SIDA, la política y la búsqueda de redención.", genero: "Drama", pais: "Estados Unidos", director: "Oskar Eustis", anio: 1991 },
 
  // TEATRO MEXICANO
  { titulo: "Los empeños de una casa", sinopsis: "Comedia de enredo donde dos parejas de enamorados se ven separadas y deben ingeniárselas para reunirse en una noche de confusiones.", genero: "Comedia", pais: "México", director: "Sor Juana Inés de la Cruz", anio: 1683 },
  { titulo: "El gesticulador", sinopsis: "Un profesor de historia fracasado suplanta la identidad de un héroe revolucionario desaparecido para obtener poder político en un pueblo de provincia.", genero: "Drama", pais: "México", director: "Rodolfo Usigli", anio: 1947 },
  { titulo: "Corona de sombra", sinopsis: "La emperatriz Carlota, ya anciana y demente, recuerda el efímero imperio mexicano de Maximiliano y la tragedia que lo destruyó.", genero: "Drama histórico", pais: "México", director: "Rodolfo Usigli", anio: 1947 },
  { titulo: "Rosalba y los Llaveros", sinopsis: "Rosalba llega de visita a casa de sus parientes provincianos y su presencia desestabiliza el orden familiar y los secretos guardados.", genero: "Comedia", pais: "México", director: "Emilio Carballido", anio: 1950 },
  { titulo: "Yo también hablo de la rosa", sinopsis: "Dos jóvenes de barrio son atrapados después de un accidente en las vías del tren. Cada personaje interpreta los hechos desde su propia verdad.", genero: "Drama experimental", pais: "México", director: "Emilio Carballido", anio: 1966 },
  { titulo: "El día que se soltaron los leones", sinopsis: "Los leones del zoológico de Chapultepec escapan y la ciudad entera reacciona de formas inesperadas en esta comedia absurda.", genero: "Comedia", pais: "México", director: "Emilio Carballido", anio: 1963 },
  { titulo: "Luisa Fernanda", sinopsis: "Drama romántico ambientado en el México colonial que retrata la tragedia de una mujer atrapada entre el amor y el deber.", genero: "Drama", pais: "México", director: "Sergio Magaña", anio: 1955 },
  { titulo: "Moctezuma II", sinopsis: "Los últimos días del tlatoani azteca antes y durante la conquista española, desde una mirada que cuestiona la historia oficial.", genero: "Drama histórico", pais: "México", director: "Sergio Magaña", anio: 1953 },
  { titulo: "El eterno femenino", sinopsis: "Una mujer bajo el secador de cabello sueña con distintas versiones de la feminidad a lo largo de la historia de México.", genero: "Farsa", pais: "México", director: "Rosario Castellanos", anio: 1975 },
  { titulo: "Nadie sabe nada", sinopsis: "Una comedia sobre los enredos y malentendidos de la vida cotidiana en la Ciudad de México contemporánea.", genero: "Comedia", pais: "México", director: "Víctor Hugo Rascón Banda", anio: 1988 },
  { titulo: "La paz ficticia", sinopsis: "Un drama sobre la violencia, la impunidad y la búsqueda de justicia en el México contemporáneo.", genero: "Drama", pais: "México", director: "Alejandro Ricaño", anio: 2010 },
  { titulo: "Dramatis Personae", sinopsis: "Una obra que explora la identidad y los mecanismos del teatro mismo como forma de entender la realidad.", genero: "Drama experimental", pais: "México", director: "Luis Mario Moncada", anio: 2005 },
 
  // TEATRO LATINOAMERICANO
  { titulo: "La casa de Bernarda Alba", sinopsis: "Tras la muerte de su segundo marido, Bernarda impone ocho años de luto a sus cinco hijas. La represión y el deseo chocan en silencio hasta estallar.", genero: "Drama", pais: "España", director: "Federico García Lorca", anio: 1945 },
  { titulo: "Bodas de sangre", sinopsis: "Una novia huye con su antiguo amor el día de su boda. La tragedia es inevitable en este poema dramático sobre el deseo y la muerte.", genero: "Tragedia", pais: "España", director: "Federico García Lorca", anio: 1933 },
  { titulo: "Yerma", sinopsis: "Una mujer en un pueblo rural español es consumida por su deseo de ser madre mientras su matrimonio se vacía de sentido y amor.", genero: "Tragedia", pais: "España", director: "Federico García Lorca", anio: 1934 },
  { titulo: "El año en que nací", sinopsis: "Obra documental basada en testimonios de jóvenes chilenos nacidos en 1973, el año del golpe militar, que exploran su identidad y herencia histórica.", genero: "Teatro documental", pais: "Chile", director: "Marco Layera", anio: 2012 },
  { titulo: "La chunga", sinopsis: "En un bar de Piura, cuatro hombres recuerdan a Meche, una mujer que desapareció una noche con la dueña del local. La memoria distorsiona la verdad.", genero: "Drama", pais: "Perú", director: "Mario Vargas Llosa", anio: 1986 },
  { titulo: "Señorita de Tacna", sinopsis: "Un escritor intenta reconstruir la historia de su tía abuela Mamae a través de los fragmentos de memoria que le quedan.", genero: "Drama", pais: "Perú", director: "Mario Vargas Llosa", anio: 1981 },
  { titulo: "Decir sí", sinopsis: "Un cliente en una peluquería acepta pasivamente cada petición del peluquero hasta que la situación llega a un límite absurdo.", genero: "Absurdismo", pais: "Argentina", director: "Griselda Gambaro", anio: 1974 },
  { titulo: "El campo", sinopsis: "Una familia parece vivir en una apacible casa de campo, pero detalles perturbadores revelan que están en un campo de concentración.", genero: "Drama", pais: "Argentina", director: "Griselda Gambaro", anio: 1967 },
  { titulo: "Crónica de una muerte anunciada", sinopsis: "Adaptación de la novela de García Márquez. Un pueblo entero sabe que Santiago Nasar será asesinado pero nadie hace nada para evitarlo.", genero: "Drama", pais: "Colombia", director: "Gabriel García Márquez", anio: 1987 },
  { titulo: "Tres tristes tigres", sinopsis: "Tres personajes encarnados por el mismo actor se buscan y se pierden en una ciudad que podría ser cualquier ciudad latinoamericana.", genero: "Drama experimental", pais: "Chile", director: "Raúl Ruiz", anio: 1967 },
 
  // TEATRO CONTEMPORÁNEO INTERNACIONAL
  { titulo: "Copenhagen", sinopsis: "Los fantasmas de Werner Heisenberg y Niels Bohr, junto a la esposa de Bohr, intentan reconstruir qué pasó en su misterioso encuentro de 1941.", genero: "Drama", pais: "Reino Unido", director: "Michael Blakemore", anio: 1998 },
  { titulo: "The Curious Incident of the Dog in the Night-Time", sinopsis: "Christopher, un adolescente con autismo, investiga la muerte del perro de su vecina y descubre secretos que cambiarán su vida para siempre.", genero: "Drama", pais: "Reino Unido", director: "Marianne Elliott", anio: 2012 },
  { titulo: "War Horse", sinopsis: "Joey, un caballo criado en Devon, es vendido al ejército británico en la Primera Guerra Mundial. Su joven dueño cruza Europa para encontrarlo.", genero: "Drama", pais: "Reino Unido", director: "Marianne Elliott", anio: 2007 },
  { titulo: "Jerusalem", sinopsis: "Johnny Byron vive en un bosque inglés resistiendo al mundo moderno. La víspera de San Jorge, autoridades y vecinos quieren desalojarlo.", genero: "Drama", pais: "Reino Unido", director: "Ian Rickson", anio: 2009 },
  { titulo: "The Inheritance", sinopsis: "Dos generaciones de hombres gay en Nueva York buscan conectar con la historia de quienes los precedieron durante la crisis del SIDA.", genero: "Drama", pais: "Reino Unido", director: "Stephen Daldry", anio: 2018 },
  { titulo: "Slave Play", sinopsis: "Tres parejas interraciales participan en una terapia de inmersión histórica que revive la esclavitud estadounidense para explorar el trauma y el deseo.", genero: "Drama", pais: "Estados Unidos", director: "Robert O'Hara", anio: 2018 },
  { titulo: "Doubt: A Parable", sinopsis: "Una monja sospecha que un sacerdote abusó de un alumno. Sin pruebas, la certeza moral enfrenta a la institución religiosa.", genero: "Drama", pais: "Estados Unidos", director: "Doug Hughes", anio: 2004 },
  { titulo: "August: Osage County", sinopsis: "La familia Weston se reúne en Oklahoma tras la desaparición del patriarca. Lo que sigue es una explosión de secretos, resentimientos y dolor.", genero: "Drama", pais: "Estados Unidos", director: "Anna D. Shapiro", anio: 2007 },
  { titulo: "The Children", sinopsis: "Dos científicos jubilados viven en aislamiento tras un desastre nuclear. La llegada de una excolega los pone frente a una decisión moral irreversible.", genero: "Drama", pais: "Reino Unido", director: "James Macdonald", anio: 2016 },
  { titulo: "The Lehman Trilogy", sinopsis: "Tres generaciones de la familia Lehman construyen un imperio financiero en Estados Unidos. Una saga de 163 años que termina con el colapso de 2008.", genero: "Drama épico", pais: "Italia", director: "Sam Mendes", anio: 2018 },
 
  // TEATRO ESPAÑOL CONTEMPORÁNEO
  { titulo: "Historia de una escalera", sinopsis: "Tres generaciones de vecinos de un edificio madrileño comparten sueños, amores y fracasos en la misma escalera durante treinta años.", genero: "Drama", pais: "España", director: "Cayetano Luca de Tena", anio: 1949 },
  { titulo: "El tragaluz", sinopsis: "Dos investigadores del futuro analizan la historia de una familia española marcada por la guerra civil y la posguerra.", genero: "Drama", pais: "España", director: "José Osuna", anio: 1967 },
  { titulo: "La fundación", sinopsis: "Un grupo de presos políticos vive en una celda que uno de ellos imagina como una lujosa fundación literaria.", genero: "Drama", pais: "España", director: "José Osuna", anio: 1974 },
  { titulo: "Bajarse al moro", sinopsis: "Una joven madrileña comparte piso con una chica que viaja a Marruecos a traer hachís. Una comedia sobre la juventud española de los 80.", genero: "Comedia", pais: "España", director: "José Luis Alonso de Santos", anio: 1985 },
 
  // TEATRO ASIÁTICO Y AFRICANO
  { titulo: "Rashomon", sinopsis: "Adaptación del cuento de Akutagawa. Un asesinato es contado por cuatro testigos que dan versiones completamente distintas de lo que ocurrió.", genero: "Drama", pais: "Japón", director: "Fay Kanin", anio: 1959 },
  { titulo: "Death and the King's Horseman", sinopsis: "El jefe de caballos de un rey yoruba debe suicidarse para acompañar a su señor al otro mundo. La llegada de los colonizadores lo interrumpe.", genero: "Drama", pais: "Nigeria", director: "Wole Soyinka", anio: 1975 },
 
  // ÓPERA Y TEATRO LÍRICO
  { titulo: "La Traviata", sinopsis: "Violetta, una cortesana parisina, se enamora de Alfredo Germont, pero la sociedad y la enfermedad hacen su amor imposible.", genero: "Ópera", pais: "Italia", director: "Giuseppe Verdi", anio: 1853 },
  { titulo: "Carmen", sinopsis: "Don José, un soldado, se obsesiona con Carmen, una cigarrera gitana. Los celos lo llevan a desertar y finalmente a cometer el crimen más terrible.", genero: "Ópera", pais: "Francia", director: "Georges Bizet", anio: 1875 },
  { titulo: "La Bohème", sinopsis: "Cuatro artistas bohemios viven en la miseria en el París del siglo XIX. Rodolfo y Mimì se enamoran, pero la tuberculosis amenaza su felicidad.", genero: "Ópera", pais: "Italia", director: "Giacomo Puccini", anio: 1896 },
  { titulo: "Don Giovanni", sinopsis: "El seductor más infame de Europa seduce, engaña y mata hasta que la estatua de uno de sus muertos lo arrastra al infierno.", genero: "Ópera", pais: "Austria", director: "Wolfgang Amadeus Mozart", anio: 1787 },
  { titulo: "La flauta mágica", sinopsis: "El príncipe Tamino emprende un viaje iniciático para rescatar a Pamina de las garras del malvado Sarastro, guiado por una flauta mágica.", genero: "Ópera", pais: "Austria", director: "Wolfgang Amadeus Mozart", anio: 1791 },
];
 
async function main() {
  console.log(`Insertando ${obras.length} obras en Supabase...`);
 
  const { data, error } = await supabase.from('obras').insert(obras).select();
 
  if (error) {
    console.error('Error al insertar:', error.message);
  } else {
    console.log(`✅ ${data.length} obras insertadas correctamente.`);
  }
}
 
main();