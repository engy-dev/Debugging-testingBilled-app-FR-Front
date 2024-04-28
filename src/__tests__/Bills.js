/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList[0]).toEqual('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(function(a,b){
          return new Date(b.date) - new Date(a.date)
        })
      expect(dates).toEqual(datesSorted)
    })
    test("I can click on the 'New Bill' button which works", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const newBillButton = screen.getByTestId('btn-new-bill');
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const testingBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })
      
      const handleSubmit = jest.fn(testingBills.handleClickNewBill);
      newBillButton.addEventListener('click', handleSubmit)
      userEvent.click(newBillButton);
      expect(handleSubmit).toHaveBeenCalled();
    })
    test("the actions icon works when i click on it", () => {
      $.fn.modal = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
      const eyes = screen.getAllByTestId('icon-eye')
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const testingBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: null,
      })
      const handleClickIconEye = jest.fn(
        testingBills.handleClickIconEye(eyes[0])
      );
      eyes[0].addEventListener('click', handleClickIconEye);
      userEvent.click(eyes[0])
      expect(handleClickIconEye).toHaveBeenCalled()
    })
  })
})