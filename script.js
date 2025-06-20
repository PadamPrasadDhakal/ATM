let stage = 0;
let pin = '';
let userPIN = '1234';
let pinMode = 'login'; // 'login', 'enquiry', 'change'
const message = document.getElementById('message');
const keypad = document.getElementById('keypad');
const options = document.getElementById('options');

function showKeypad() {
  keypad.innerHTML = '';
  keypad.style.display = 'grid';
  keypad.style.gridTemplateColumns = 'repeat(3, 1fr)';
  keypad.style.gap = '20px';
  // Number and backspace keys
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0'];
  keys.forEach(label => {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = () => handleKeypad(label);
    keypad.appendChild(btn);
  });
  // OK and CANCEL in a separate row with .action-row class
  const actionRow = document.createElement('div');
  actionRow.className = 'action-row';
  const okBtn = document.createElement('button');
  okBtn.innerText = 'OK';
  okBtn.onclick = () => handleKeypad('OK');
  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'CANCEL';
  cancelBtn.onclick = () => handleKeypad('CANCEL');
  actionRow.appendChild(okBtn);
  actionRow.appendChild(cancelBtn);
  keypad.appendChild(actionRow);
}

function handleKeypad(val) {
  if (val === 'OK') {
    if (pin === userPIN && (pinMode === 'login' || pinMode === 'enquiry')) {
      keypad.style.display = 'none';
      message.innerHTML = '';
      if (pinMode === 'login') {
        setTimeout(() => { showOptions(); }, 300);
      } else if (pinMode === 'enquiry') {
        setTimeout(() => { showBalanceResult(); }, 300);
      }
      pin = '';
      pinMode = 'login';
    } else if (pinMode === 'change') {
      if (pin.length === 4) {
        userPIN = pin;
        pin = '';
        keypad.style.display = 'none';
        message.innerHTML = 'PIN changed successfully<br>पिन सफलतापूर्वक परिवर्तन भयो';
        setTimeout(showFinalMessages, 2000);
        pinMode = 'login';
      } else {
        pin = '';
        message.innerHTML = 'Enter 4 digit PIN<br>४ अंकको पिन प्रविष्ट गर्नुहोस्';
      }
    } else {
      pin = '';
      message.innerHTML = 'Incorrect PIN<br>गलत पिन';
      setTimeout(() => {
        if (pinMode === 'login') {
          message.innerHTML = 'Enter PIN<br>पिन प्रविष्ट गर्नुहोस्';
        } else if (pinMode === 'enquiry') {
          message.innerHTML = 'Re-enter PIN for Balance Enquiry<br>ब्यालेन्स हेर्न पुन: पिन प्रविष्ट गर्नुहोस्';
        } else if (pinMode === 'change') {
          message.innerHTML = 'Enter new PIN<br>नयाँ पिन प्रविष्ट गर्नुहोस्';
        }
      }, 1500);
    }
  } else if (val === '⌫') {
    pin = pin.slice(0, -1);
    message.innerHTML = '*'.repeat(pin.length);
  } else if (val === 'CANCEL') {
    keypad.style.display = 'none';
    keypad.classList.remove('compact');
    options.style.display = 'none';
    message.innerHTML = 'Your transaction is cancelled<br>तपाईंको लेनदेन रद्द गरिएको छ';
    setTimeout(() => {
      startATM();
      pin = '';
      pinMode = 'login';
    }, 3000);
  } else if (pin.length < 4 && !isNaN(val)) {
    pin += val;
    message.innerHTML = '*'.repeat(pin.length);
  }
}

function showOptions() {
  options.style.display = 'grid';
  options.style.gridTemplateColumns = '1fr 1fr';
  options.style.gridTemplateRows = 'repeat(3, 1fr)';
  options.style.gap = '10px';
  options.innerHTML = '';
  const btns = [
    { label: 'Enquiry Balance<br>ब्यालेन्स हेर्नुहोस्', fn: showEnquiryOptions },
    { label: 'Withdraw Money<br>पैसा निकालनूस', fn: showWithdrawOptions },
    { label: 'Deposit Money<br>पैसा जम्मा गर्नुहोस्', fn: showDepositOptions },
    { label: 'Change PIN<br>पिन परिवर्तन गर्नुहोस्', fn: changePIN },
    { label: 'Transaction History Print<br>लेनदेनको इतिहास प्रिन्ट', fn: showTransactionOptions },
    { label: 'Fund Transfer<br>रकम स्थानान्तरण गर्नुहोस्', fn: showFundTransferOptions }
  ];
  btns.forEach((btn, i) => {
    const b = document.createElement('button');
    b.innerHTML = btn.label;
    b.onclick = btn.fn;
    b.className = 'option-btn option-' + (i+1);
    options.appendChild(b);
  });
}

function showWithdrawOptions() {
  options.innerHTML = '';
  message.innerHTML = 'Select Amount<br>रकम छान्नुहोस्';
  options.style.display = 'grid';
  options.style.gridTemplateColumns = '1fr 1fr';
  options.style.gridTemplateRows = 'repeat(4, 1fr)';
  options.style.gap = '10px';

  const leftAmounts = [500, 1000, 2000, 5000];
  const rightAmounts = [8000, 10000, 15000, 'Custom Entry'];

  for (let i = 0; i < 4; i++) {
    // Left column
    const leftBtn = document.createElement('button');
    leftBtn.innerText = leftAmounts[i];
    leftBtn.onclick = showSuccess;
    leftBtn.style.margin = '5px';
    leftBtn.style.gridColumn = '1';
    leftBtn.style.gridRow = (i + 1).toString();
    options.appendChild(leftBtn);

    // Right column
    const rightBtn = document.createElement('button');
    rightBtn.innerText = rightAmounts[i];
    rightBtn.style.margin = '5px';
    rightBtn.style.gridColumn = '2';
    rightBtn.style.gridRow = (i + 1).toString();
    if (rightAmounts[i] === 'Custom Entry') {
      rightBtn.onclick = showCustomWithdrawEntry;
    } else {
      rightBtn.onclick = showSuccess;
    }
    options.appendChild(rightBtn);
  }
}

function showCustomWithdrawEntry() {
  options.innerHTML = '';
  keypad.innerHTML = '';
  keypad.classList.add('compact');
  message.innerHTML = 'Enter custom amount<br>अनुकूल रकम प्रविष्ट गर्नुहोस्';

  // Create input field
  const inputDiv = document.createElement('div');
  inputDiv.style.display = 'flex';
  inputDiv.style.justifyContent = 'center';
  inputDiv.style.margin = '30px 0 20px 0';
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.pattern = '[0-9]*';
  input.maxLength = 5;
  input.style.fontSize = '2rem';
  input.style.textAlign = 'center';
  input.style.width = '180px';
  input.style.padding = '10px';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid #0074D9';
  input.style.outline = 'none';
  input.placeholder = 'Amount';
  input.value = '';
  input.oninput = function() {
    // Remove leading zeros and limit to 5 digits
    this.value = this.value.replace(/^0+/, '').replace(/[^0-9]/g, '').slice(0, 5);
  };
  inputDiv.appendChild(input);
  options.appendChild(inputDiv);

  // On-screen keypad
  keypad.style.display = 'grid';
  keypad.style.gridTemplateColumns = 'repeat(3, 1fr)';
  keypad.style.gap = '8px';
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0'];
  keys.forEach(label => {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = () => {
      if (label === '⌫') {
        input.value = input.value.slice(0, -1);
      } else if (!isNaN(label)) {
        if (input.value.length < 5) {
          if (!(input.value === '' && label === '0')) {
            input.value += label;
          }
        }
      }
      input.dispatchEvent(new Event('input'));
    };
    keypad.appendChild(btn);
  });
  // OK and CANCEL in a separate row with .action-row class
  const actionRow = document.createElement('div');
  actionRow.className = 'action-row';
  const okBtn = document.createElement('button');
  okBtn.innerText = 'OK';
  okBtn.onclick = () => {
    const val = input.value.trim();
    if (val && !isNaN(val) && Number(val) > 0) {
      options.innerHTML = '';
      keypad.innerHTML = '';
      keypad.classList.remove('compact');
      showSuccess();
    } else {
      message.innerHTML = 'Enter a valid amount<br>मान्य रकम प्रविष्ट गर्नुहोस्';
    }
  };
  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'CANCEL';
  cancelBtn.onclick = () => {
    options.innerHTML = '';
    keypad.innerHTML = '';
    keypad.classList.remove('compact');
    message.innerHTML = 'Your transaction is cancelled<br>तपाईंको लेनदेन रद्द गरिएको छ';
    setTimeout(() => {
      startATM();
    }, 3000);
  };
  actionRow.appendChild(okBtn);
  actionRow.appendChild(cancelBtn);
  keypad.appendChild(actionRow);
}

function showDepositOptions() {
  options.innerHTML = '';
  message.innerHTML = 'Enter the amount (only 1000 or 500 are accepted)<br>रकम प्रविष्ट गर्नुहोस् (केवल १००० वा ५०० मात्र स्वीकारिन्छ)';
  keypad.innerHTML = '';
  keypad.style.display = 'grid';
  keypad.style.gridTemplateColumns = 'repeat(3, 1fr)';
  keypad.style.gap = '10px';
  let depositAmount = '';
  // Number and backspace keys
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0'];
  keys.forEach(label => {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = () => {
      if (label === '⌫') {
        depositAmount = depositAmount.slice(0, -1);
        message.innerHTML = 'Enter the amount (only 1000 or 500 are accepted)<br>रकम प्रविष्ट गर्नुहोस् (केवल १००० वा ५०० मात्र स्वीकारिन्छ)<br>' + depositAmount;
      } else if (!isNaN(label)) {
        depositAmount += label;
        message.innerHTML = 'Enter the amount (only 1000 or 500 are accepted)<br>रकम प्रविष्ट गर्नुहोस् (केवल १००० वा ५०० मात्र स्वीकारिन्छ)<br>' + depositAmount;
      }
    };
    keypad.appendChild(btn);
  });
  // OK and CANCEL in a separate row
  const actionRow = document.createElement('div');
  actionRow.style.display = 'flex';
  actionRow.style.justifyContent = 'space-between';
  actionRow.style.gridColumn = '1 / span 3';
  actionRow.style.marginTop = '10px';
  const okBtn = document.createElement('button');
  okBtn.innerText = 'OK';
  okBtn.style.flex = '1';
  okBtn.onclick = () => {
    if (depositAmount === '1000' || depositAmount === '500') {
      keypad.style.display = 'none';
      showSuccess();
    } else {
      message.innerHTML = 'Only 1000 or 500 accepted<br>केवल १००० वा ५०० मात्र स्वीकारिन्छ';
    }
  };
  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'CANCEL';
  cancelBtn.style.flex = '1';
  cancelBtn.onclick = () => {
    keypad.style.display = 'none';
    options.style.display = 'none';
    message.innerHTML = 'Your transaction is cancelled<br>तपाईंको लेनदेन रद्द गरिएको छ';
    setTimeout(() => {
      startATM();
    }, 3000);
  };
  actionRow.appendChild(okBtn);
  actionRow.appendChild(cancelBtn);
  keypad.appendChild(actionRow);
}

function showEnquiryOptions() {
  options.innerHTML = '';
  message.innerHTML = 'Re-enter PIN for Balance Enquiry<br>ब्यालेन्स हेर्न पुन: पिन प्रविष्ट गर्नुहोस्';
  pin = '';
  pinMode = 'enquiry';
  showKeypad();
}

function showBalanceResult() {
  options.innerHTML = '';
  message.innerHTML = 'Your Balance: Rs. 50,000<br>तपाईंको ब्यालेन्स: रु. ५०,०००';
  const printBtn = document.createElement('button');
  printBtn.innerText = 'Print';
  printBtn.onclick = function() {
    options.style.display = 'none';
    message.innerHTML = 'Printing...<br>प्रिन्ट हुँदैछ';
    setTimeout(() => {
      message.innerHTML = 'Take your receipt<br>रसीद लिनुहोस्';
      setTimeout(() => {
        startATM();
      }, 2000);
    }, 2000);
  };
  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'Cancel';
  cancelBtn.onclick = function() {
    options.style.display = 'none';
    message.innerHTML = 'Your transaction is cancelled<br>तपाईंको लेनदेन रद्द गरिएको छ';
    setTimeout(() => {
      startATM();
    }, 2000);
  };
  options.appendChild(printBtn);
  options.appendChild(cancelBtn);
  options.style.display = 'grid';
  options.style.gridTemplateColumns = '1fr 1fr';
  options.style.gap = '10px';
}

function showTransactionOptions() {
  options.innerHTML = '';
  message.innerHTML = 'Select Transaction Type<br>लेनदेन प्रकार छान्नुहोस्';
  ['Mini Statement', 'Full Statement'].forEach(type => {
    const btn = document.createElement('button');
    btn.innerText = type;
    btn.onclick = showPrintStatementFlow;
    btn.style.margin = '5px';
    options.appendChild(btn);
  });
}

function showPrintStatementFlow() {
  options.style.display = 'none';
  keypad.innerHTML = '';
  message.innerHTML = 'Your statement is being printed<br>तपाईंको स्टेटमेन्ट प्रिन्ट हुँदैछ';
  setTimeout(() => {
    message.innerHTML = 'Take your Recipt<br>तपाईंको स्टैट्मन्ट लिनुहोस्';
    setTimeout(() => {
      startATM();
    }, 2000);
  }, 3000);
}

function showFundTransferOptions() {
  options.innerHTML = '';
  message.innerHTML = 'Select Transfer Type<br>स्थानान्तरण प्रकार छान्नुहोस्';
  ['Own Account', 'Other Bank', 'Mobile Wallet'].forEach(type => {
    const btn = document.createElement('button');
    btn.innerText = type;
    btn.onclick = showSuccess;
    btn.style.margin = '5px';
    options.appendChild(btn);
  });
}

function showSuccess() {
  options.style.display = 'none';
  message.innerHTML = 'Transaction Successful<br>लेनदेन सफल भयो';
  setTimeout(showFinalMessages, 2000);
}

function changePIN() {
  pin = '';
  pinMode = 'change';
  message.innerHTML = 'Enter new PIN<br>नयाँ पिन प्रविष्ट गर्नुहोस्';
  showKeypad();
}

function showFinalMessages() {
  message.innerHTML = 'Please take your card<br>कृपया तपाईंको कार्ड लिनुहोस्';
  setTimeout(() => {
    message.innerHTML = 'Take your money<br>पैसा लिनुहोस्';
    setTimeout(() => {
      message.innerHTML = 'Take the receipt<br>रसिद लिनुहोस्';
      setTimeout(() => {
        startATM();
      }, 2000);
    }, 2000);
  }, 2000);
}

// Initial flow: Insert card, wait, process, then PIN
function startATM() {
  message.innerHTML = 'Please insert your card<br>कृपया तपाईंको कार्ड हाल्नुहोस्';
  keypad.style.display = 'none';
  keypad.innerHTML = '';
  keypad.classList.remove('compact');
  options.style.display = 'none';
  options.innerHTML = '';
  pin = '';
  pinMode = 'login';
  setTimeout(() => {
    message.innerHTML = 'Your transaction is being processed<br>तपाईंको लेनदेन प्रक्रिया हुँदैछ';
    setTimeout(() => {
      message.innerHTML = 'Enter PIN<br>पिन प्रविष्ट गर्नुहोस्';
      showKeypad();
    }, 3000);
  }, 5000);
}

startATM();
