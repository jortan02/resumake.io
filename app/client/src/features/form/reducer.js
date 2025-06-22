/**
 * @flow
 */

import { reducer } from 'redux-form'
import type { FormState } from './types'
import type { Action } from '../../app/types'

const initialState = {
  jsonUpload: {},
  values: {
    selectedTemplate: 1,
    headings: {
      work: '',
      education: '',
      skills: '',
      projects: '',
      awards: ''
    },
    basics: {
      name: '',
      email: '',
      phone: '',
      website: '',
      location: {
        address: ''
      },
      summaries: ['']
    },
    education: [
      {
        institution: '',
        location: '',
        area: '',
        studyType: '',
        startDate: '',
        endDate: '',
        gpa: '',
        enabled: true
      }
    ],
    work: [
      {
        company: '',
        location: '',
        position: '',
        website: '',
        startDate: '',
        endDate: '',
        highlights: [''],
        enabled: true
      }
    ],
    skills: [
      {
        name: '',
        level: '',
        keywords: [''],
        enabled: true
      }
    ],
    projects: [
      {
        name: '',
        description: '',
        url: '',
        keywords: [''],
        enabled: true
      }
    ],
    awards: [
      {
        title: '',
        date: '',
        awarder: '',
        summary: '',
        enabled: true
      }
    ],
    tailor: {
      description: '',
      sections: {
        work: true,
        education: true,
        skills: true,
        projects: true,
        awards: true
      }
    }
  },
  tailorUpload: {}
}

function form(state: FormState = initialState, action: Action): FormState {
  switch (action.type) {
    case 'UPLOAD_JSON_REQUEST': {
      return {
        ...state,
        jsonUpload: {
          status: 'pending'
        }
      }
    }

    case 'UPLOAD_JSON_SUCCESS': {
      return {
        ...state,
        jsonUpload: {
          status: 'success'
        },
        values: {
          ...state.values,
          ...action.json
        }
      }
    }

    case 'UPLOAD_JSON_FAILURE': {
      return {
        ...state,
        jsonUpload: {
          status: 'failure',
          errMessage: action.errMessage
        }
      }
    }

    case 'SELECT_TEMPLATE': {
      return {
        ...state,
        values: {
          ...state.values,
          selectedTemplate: action.templateId
        }
      }
    }

    case 'ADD_SCHOOL': {
      return {
        ...state,
        values: {
          ...state.values,
          education: [...state.values.education, { enabled: true }]
        }
      }
    }

    case 'REMOVE_SCHOOL': {
      if (state.values.education.length <= 1) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          education: state.values.education.slice(0, -1)
        }
      }
    }

    case 'ADD_PROFILE_SUMMARY': {
      return {
        ...state,
        values: {
          ...state.values,
          basics: {
            ...state.values.basics,
            summaries: [...state.values.basics.summaries, '']
          }
        }
      }
    }

    case 'REMOVE_PROFILE_SUMMARY': {
      if (state.values.basics.summaries.length <= 1) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          basics: {
            ...state.values.basics,
            summaries: state.values.basics.summaries.slice(0, -1)
          }
        }
      }
    }

    case 'ADD_JOB': {
      return {
        ...state,
        values: {
          ...state.values,
          work: [...state.values.work, { highlights: [''], enabled: true }]
        }
      }
    }

    case 'REMOVE_JOB': {
      if (state.values.work.length <= 1) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          work: state.values.work.slice(0, -1)
        }
      }
    }

    case 'ADD_JOB_HIGHLIGHT': {
      return {
        ...state,
        values: {
          ...state.values,
          work: [
            ...state.values.work.slice(0, action.index),
            {
              ...state.values.work[action.index],
              highlights: [...state.values.work[action.index].highlights, '']
            },
            ...state.values.work.slice(action.index + 1)
          ]
        }
      }
    }

    case 'REMOVE_JOB_HIGHLIGHT': {
      if (
        !state.values.work[action.index] ||
        !state.values.work[action.index].highlights ||
        state.values.work[action.index].highlights.length <= 1
      ) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          work: [
            ...state.values.work.slice(0, action.index),
            {
              ...state.values.work[action.index],
              highlights: state.values.work[action.index].highlights.slice(
                0,
                -1
              )
            },
            ...state.values.work.slice(action.index + 1)
          ]
        }
      }
    }

    case 'ADD_SKILL': {
      return {
        ...state,
        values: {
          ...state.values,
          skills: [
            ...state.values.skills,
            {
              keywords: [''],
              enabled: true
            }
          ]
        }
      }
    }

    case 'REMOVE_SKILL': {
      if (state.values.skills.length <= 1) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          skills: state.values.skills.slice(0, -1)
        }
      }
    }

    case 'ADD_SKILL_KEYWORD': {
      return {
        ...state,
        values: {
          ...state.values,
          skills: [
            ...state.values.skills.slice(0, action.index),
            {
              ...state.values.skills[action.index],
              keywords: [...state.values.skills[action.index].keywords, '']
            },
            ...state.values.skills.slice(action.index + 1)
          ]
        }
      }
    }

    case 'REMOVE_SKILL_KEYWORD': {
      if (
        !state.values.skills[action.index] ||
        !state.values.skills[action.index].keywords ||
        state.values.skills[action.index].keywords.length <= 1
      ) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          skills: [
            ...state.values.skills.slice(0, action.index),
            {
              ...state.values.skills[action.index],
              keywords: state.values.skills[action.index].keywords.slice(0, -1)
            },
            ...state.values.skills.slice(action.index + 1)
          ]
        }
      }
    }

    case 'ADD_PROJECT': {
      return {
        ...state,
        values: {
          ...state.values,
          projects: [...state.values.projects, { keywords: [''], enabled: true }]
        }
      }
    }

    case 'REMOVE_PROJECT': {
      if (state.values.projects.length <= 1) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          projects: state.values.projects.slice(0, -1)
        }
      }
    }

    case 'ADD_PROJECT_KEYWORD': {
      return {
        ...state,
        values: {
          ...state.values,
          projects: [
            ...state.values.projects.slice(0, action.index),
            {
              ...state.values.projects[action.index],
              keywords: [...state.values.projects[action.index].keywords, '']
            },
            ...state.values.projects.slice(action.index + 1)
          ]
        }
      }
    }

    case 'REMOVE_PROJECT_KEYWORD': {
      if (
        !state.values.projects[action.index] ||
        !state.values.projects[action.index].keywords ||
        state.values.projects[action.index].keywords.length <= 1
      ) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          projects: [
            ...state.values.projects.slice(0, action.index),
            {
              ...state.values.projects[action.index],
              keywords: state.values.projects[action.index].keywords.slice(
                0,
                -1
              )
            },
            ...state.values.projects.slice(action.index + 1)
          ]
        }
      }
    }

    case 'ADD_AWARD': {
      return {
        ...state,
        values: {
          ...state.values,
          awards: [...state.values.awards, { enabled: true }]
        }
      }
    }

    case 'REMOVE_AWARD': {
      if (state.values.awards.length <= 1) {
        return state
      }

      return {
        ...state,
        values: {
          ...state.values,
          awards: state.values.awards.slice(0, -1)
        }
      }
    }

    case 'TOGGLE_WORK_ITEM': {
      return {
        ...state,
        values: {
          ...state.values,
          work: state.values.work.map((item, index) => 
            index === action.index 
              ? { ...item, enabled: !item.enabled }
              : item
          )
        }
      }
    }

    case 'TOGGLE_EDUCATION_ITEM': {
      return {
        ...state,
        values: {
          ...state.values,
          education: state.values.education.map((item, index) => 
            index === action.index 
              ? { ...item, enabled: !item.enabled }
              : item
          )
        }
      }
    }

    case 'TOGGLE_SKILL_ITEM': {
      return {
        ...state,
        values: {
          ...state.values,
          skills: state.values.skills.map((item, index) => 
            index === action.index 
              ? { ...item, enabled: !item.enabled }
              : item
          )
        }
      }
    }

    case 'TOGGLE_PROJECT_ITEM': {
      return {
        ...state,
        values: {
          ...state.values,
          projects: state.values.projects.map((item, index) => 
            index === action.index 
              ? { ...item, enabled: !item.enabled }
              : item
          )
        }
      }
    }

    case 'TOGGLE_AWARD_ITEM': {
      return {
        ...state,
        values: {
          ...state.values,
          awards: state.values.awards.map((item, index) => 
            index === action.index 
              ? { ...item, enabled: !item.enabled }
              : item
          )
        }
      }
    }

    case 'UPLOAD_TAILOR_REQUEST': {
      return {
        ...state,
        tailorUpload: {
          status: 'pending'
        }
      }
    }

    case 'UPLOAD_TAILOR_SUCCESS': {
      return {
        ...state,
        tailorUpload: {
          status: 'success',
        },
        values: {
          ...state.values,
          ...action.tailoredData
        }
      }
    }

    case 'UPLOAD_TAILOR_FAILURE': {
      return {
        ...state,
        tailorUpload: {
          status: 'failure',
          errMessage: action.errMessage
        }
      }
    }

    default:
      return state
  }
}

export { form, initialState }
export default reducer.plugin({ resume: form })
