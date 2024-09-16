class TaxRecordLookup extends HTMLElement {
  constructor() {
    super();
    this.config = Object.assign({}, this.parentNode.dataset);
    this.users = [];

    this.innerHTML = `
      <div>
        <form id="lookupForm">
          <label>First Name:</label>
          <input type="text" id="fname" placeholder="First Name">
          <label>Last Name:</label>
          <input type="text" id="lname" placeholder="Last Name">
          <label>SSN:</label>
          <input type="text" id="ssn" placeholder="SSN">
          <button type="submit">Search</button>
        </form>
        <table id="resultTable" style="display:none;">
          <thead>
            <tr>
              <th>Year</th>
              <th>Annual Income</th>
              <th>Tax Paid</th>
              <th>Filing Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    // Fetch the external JSON file with user data
    this.fetchUserData();

    // Add the event listener for the form submission
    this.querySelector('#lookupForm').addEventListener('submit', this.lookupUser.bind(this));
  }

  async fetchUserData() {
    try {
      const response = await fetch(this.config.url);
      const data = await response.json();
      this.users = data.users;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  lookupUser(event) {
    event.preventDefault();
    const fname = this.querySelector('#fname').value.toLowerCase();
    const lname = this.querySelector('#lname').value.toLowerCase();
    const ssn = this.querySelector('#ssn').value;

    let foundUser = null;

    // Search by SSN if provided
    if (ssn) {
      foundUser = this.users.find(user => user.ssn === ssn);
    } else if (fname && lname) {
      // Search by first name and last name
      foundUser = this.users.find(user => user.fname.toLowerCase() === fname && user.lname.toLowerCase() === lname);
    }

    if (foundUser) {
      this.displayTaxRecords(foundUser.tax_info);
    } else {
      alert('User not found!');
      this.querySelector('#resultTable').style.display = 'none';
    }
  }

  displayTaxRecords(taxInfo) {
    const tableBody = this.querySelector('#resultTable tbody');
    tableBody.innerHTML = '';  // Clear previous results

    taxInfo.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.year}</td>
        <td>${record.annual_income}</td>
        <td>${record.tax_paid}</td>
        <td>${record.filing_status}</td>
      `;
      tableBody.appendChild(row);
    });

    this.querySelector('#resultTable').style.display = 'table';
  }
}

customElements.define('tax-record-lookup', TaxRecordLookup);

