const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Category = require("./models/Category");
const Book = require("./models/Book");

dotenv.config();

const categoriesData = [
  {
    name: "Programming",
    description: "Programming and software development",
  },
  {
    name: "Business",
    description: "Business and management",
  },
  {
    name: "Science",
    description: "Science and technology",
  },
  {
    name: "Fiction",
    description: "Novels and fiction",
  },
  {
    name: "Self Development",
    description: "Personal development",
  },
];

const booksData = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    description: "A handbook of agile software craftsmanship.",
    price: 450,
    discountPrice: 400,
    stock: 15,
    category: "Programming",
    image: "https://covers.openlibrary.org/isbn/9780132350884-L.jpg",
  },

  {
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    isbn: "9780135957059",
    description: "A guide to software development.",
    price: 500,
    discountPrice: 450,
    stock: 12,
    category: "Programming",
    image: "https://covers.openlibrary.org/isbn/9780135957059-L.jpg",
  },

  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    isbn: "9780596517748",
    description: "A guide to JavaScript.",
    price: 350,
    discountPrice: 300,
    stock: 20,
    category: "Programming",
    image: "https://covers.openlibrary.org/isbn/9780596517748-L.jpg",
  },

  {
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    isbn: "9781593279509",
    description: "Modern JavaScript programming.",
    price: 380,
    discountPrice: 330,
    stock: 18,
    category: "Programming",
    image: "https://covers.openlibrary.org/isbn/9781593279509-L.jpg",
  },

  {
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    isbn: "9781491904244",
    description: "Deep JavaScript concepts.",
    price: 400,
    discountPrice: 350,
    stock: 10,
    category: "Programming",
    image: "https://covers.openlibrary.org/isbn/9781491904244-L.jpg",
  },

  {
    title: "Node.js Design Patterns",
    author: "Mario Casciaro",
    isbn: "9781839214110",
    description: "Node.js patterns and best practices.",
    price: 550,
    discountPrice: 500,
    stock: 9,
    category: "Programming",
    image: "https://covers.openlibrary.org/isbn/9781839214110-L.jpg",
  },

  {
    title: "The Lean Startup",
    author: "Eric Ries",
    isbn: "9780307887894",
    description: "Continuous innovation for startups.",
    price: 320,
    discountPrice: 280,
    stock: 25,
    category: "Business",
    image: "https://covers.openlibrary.org/isbn/9780307887894-L.jpg",
  },

  {
    title: "Good to Great",
    author: "Jim Collins",
    isbn: "9780066620992",
    description: "How companies become great.",
    price: 370,
    discountPrice: 320,
    stock: 14,
    category: "Business",
    image: "https://covers.openlibrary.org/isbn/9780066620992-L.jpg",
  },

  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    isbn: "9781982137274",
    description: "Lessons in personal change.",
    price: 300,
    discountPrice: 260,
    stock: 22,
    category: "Business",
    image: "https://covers.openlibrary.org/isbn/9781982137274-L.jpg",
  },

  {
    title: "Zero to One",
    author: "Peter Thiel",
    isbn: "9780804139298",
    description: "Notes on startups and the future.",
    price: 330,
    discountPrice: 290,
    stock: 16,
    category: "Business",
    image: "https://covers.openlibrary.org/isbn/9780804139298-L.jpg",
  },

  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    description: "A popular science book.",
    price: 280,
    discountPrice: 240,
    stock: 20,
    category: "Science",
    image: "https://covers.openlibrary.org/isbn/9780553380163-L.jpg",
  },

  {
    title: "Cosmos",
    author: "Carl Sagan",
    isbn: "9780345539434",
    description: "Science and the universe.",
    price: 350,
    discountPrice: 300,
    stock: 13,
    category: "Science",
    image: "https://covers.openlibrary.org/isbn/9780345539434-L.jpg",
  },

  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    isbn: "9780199291151",
    description: "Evolutionary biology.",
    price: 390,
    discountPrice: 340,
    stock: 11,
    category: "Science",
    image: "https://covers.openlibrary.org/isbn/9780199291151-L.jpg",
  },

  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    description: "A fantasy adventure.",
    price: 300,
    discountPrice: 250,
    stock: 30,
    category: "Fiction",
    image: "https://covers.openlibrary.org/isbn/9780547928227-L.jpg",
  },

  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    description: "A dystopian novel.",
    price: 220,
    discountPrice: 190,
    stock: 35,
    category: "Fiction",
    image: "https://covers.openlibrary.org/isbn/9780451524935-L.jpg",
  },

  {
    title: "Animal Farm",
    author: "George Orwell",
    isbn: "9780451526342",
    description: "A political allegory.",
    price: 200,
    discountPrice: 170,
    stock: 28,
    category: "Fiction",
    image: "https://covers.openlibrary.org/isbn/9780451526342-L.jpg",
  },

  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    description: "A classic American novel.",
    price: 250,
    discountPrice: 210,
    stock: 19,
    category: "Fiction",
    image: "https://covers.openlibrary.org/isbn/9780743273565-L.jpg",
  },

  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    description: "Building good habits.",
    price: 320,
    discountPrice: 280,
    stock: 25,
    category: "Self Development",
    image: "https://covers.openlibrary.org/isbn/9780735211292-L.jpg",
  },

  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    isbn: "9781585424337",
    description: "A classic success book.",
    price: 270,
    discountPrice: 230,
    stock: 17,
    category: "Self Development",
    image: "https://covers.openlibrary.org/isbn/9781585424337-L.jpg",
  },

  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    isbn: "9781577314806",
    description: "A guide to living in the present.",
    price: 300,
    discountPrice: 260,
    stock: 15,
    category: "Self Development",
    image: "https://covers.openlibrary.org/isbn/9781577314806-L.jpg",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    await Book.deleteMany({});
    await Category.deleteMany({});

    console.log("Old data deleted");

    const categories = await Category.insertMany(categoriesData);

    const categoryMap = {};

    categories.forEach((category) => {
      categoryMap[category.name] = category._id;
    });

    const books = booksData.map((book) => ({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description,
      price: book.price,
      discountPrice: book.discountPrice,
      stock: book.stock,
      category: categoryMap[book.category],
      images: [book.image],
    }));

    await Book.insertMany(books);

    console.log(`${categories.length} categories created`);

    console.log(`${books.length} books created`);

    console.log("Database seeded successfully");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);

    process.exit(1);
  }
}

seedDatabase();
