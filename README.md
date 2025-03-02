# [SplitMatic](https://split-matic.netlify.app/)

SplitMatic is a modern, responsive web application built with React that helps users easily split bills among groups. With an itemized bill input system, customizable currency options, detailed breakdowns, and local storage for calculation history, SplitMatic offers a clean, user-friendly interface on both desktop and mobile.

## Features

- **Itemized Bill Input:**  
  Add multiple items with a description, price, and optional tip percentage.
  
- **Detailed Breakdown:**  
  Automatically calculates each item's tip, total, and per-person share.
  
- **Responsive Design:**  
  Optimized for desktop and mobile with custom tooltips, cursor, and scrollbar styling.
  
- **Calculation History:**  
  Previous calculations are saved in local storage for quick reference.
  
- **Custom Tooltips & Cursor:**  
  Enhanced UI with styled tooltips on buttons/inputs and a custom mouse cursor.
  
- **Modals & Notifications:**  
  Confirmation modals for reset actions and clear history, plus a copy-to-clipboard feature.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/patrickperez527/SplitMatic.git

2. **Navigate into the project directory:**

    ```bash
    cd SplitMatic

3. **Install dependencies:**

    ```bash
    npm install

4. **Start the development server:**

    ```bash
    npm start

5. Open your browser at http://localhost:3000 to view the app.

# Usage
Adding Items:
Enter an item's description, price, and (optionally) tip percentage. Click + Add Item to add additional items.

Calculate Bill Split:
Provide the number of people and select a currency. Then click Calculate to see the total, tip, and per-person share.

Reset & History:
Use the Reset button to clear inputs or Clear History to remove previous calculations from local storage.

Copy Result:
Click Copy Result to copy the breakdown and totals to your clipboard.

Technologies Used
React – For building the interactive user interface.
CSS – For custom styling, including tooltips, cursor, and scrollbar design.
Local Storage – To save and retrieve calculation history.
Contributing
Contributions are welcome! If you find any bugs or have feature suggestions, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

License: This project is licensed under the MIT License.

Contact: For any questions or feedback, please contact patrickperez527@gmail.com or open an issue on GitHub.

This README covers an overview of your app, its features, installation steps, usage instructions, and contribution guidelines. Feel free to customize any section to better fit your project's details.
