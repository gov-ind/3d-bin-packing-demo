import { createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { combineReducers, applyMiddleware } from 'redux';
import threedLoadPlanReducer from './threedloadplan/reducer';

export default createStore(
  combineReducers({
    threedLoadPlan: threedLoadPlanReducer
  }),
  applyMiddleware(thunkMiddleware)
);