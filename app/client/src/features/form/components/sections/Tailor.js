/**
 * @flow
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formValueSelector, arrayMove } from 'redux-form'
import Section from './Section'
import LabeledInput, { Input, Label } from '../fragments/LabeledInput'
import { Button, Divider } from '../../../../common/components'
import type { FormValues } from '../../types'
import type { State } from '../../../../app/types'
import styled from 'styled-components'
import LabeledTextArea from '../fragments/LabeledTextArea'
import SortableResumeSections from '../fragments/SortableResumeSections'
import { uploadTailor } from '../../actions'
import { toast } from 'react-toastify'

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonRow = styled.div`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 15px;
  ${props => props.hidden && 'opacity: 0;'} transition: none;
`

const MiniInput = Input.extend`
  width: 65%;

  @media screen and (max-width: 850px) {
    width: 65%;
  }
`

type Props = {
  basics: $PropertyType<FormValues, 'basics'>,
  work: $PropertyType<FormValues, 'work'>,
  education: $PropertyType<FormValues, 'education'>,
  skills: $PropertyType<FormValues, 'skills'>,
  projects: $PropertyType<FormValues, 'projects'>,
  awards: $PropertyType<FormValues, 'awards'>,
  selectedTemplate: $PropertyType<FormValues, 'selectedTemplate'>,
  tailorDescription: ?string,
  sections: Array<string>,
  tailorUpload: Object,
  tailorSections: Object,
  dispatch: Function
}

class Tailor extends Component<Props> {
  componentDidUpdate(prevProps) {
    const { tailorUpload } = this.props
    const prevTailorUpload = prevProps.tailorUpload
    
    if (tailorUpload && tailorUpload.status !== prevTailorUpload.status) {
      if (tailorUpload.status === 'success') {
        toast.success('Resume tailored successfully')
      } else if (tailorUpload.status === 'failure') {
        toast.error(tailorUpload.errMessage)
      }
    }
  }

  onSortEnd = (sectionType, oldIndex, newIndex) => {
    // Use Redux Form's arrayMove to reorder items within the specific section
    this.props.dispatch(arrayMove('resume', sectionType, oldIndex, newIndex))
  }

  handleTailorClick = () => {
    const { tailorDescription, selectedTemplate, basics, work, education, skills, projects, awards, dispatch, tailorSections } = this.props
    
    if (!tailorDescription) return
    
    const resumeData = {
      selectedTemplate,
      basics,
      work,
      education,
      skills,
      projects,
      awards
    }
    
    dispatch(uploadTailor(resumeData, tailorDescription, tailorSections))
  }

  render() {
    const { tailorDescription, sections, work, education, skills, projects, awards, tailorUpload } = this.props
    const isLoading = tailorUpload.status === 'pending'
    const isDisabled = !tailorDescription || tailorDescription === '' || isLoading
    
    return (
      <Section heading="Tailor Your Resume">
        <LabeledTextArea label="Job Description" name="tailor.description" placeholder="Enter the job description" />
        <Button type="button" onClick={this.handleTailorClick} disabled={isDisabled}>
          {isLoading ? 'Tailoring...' : 'Tailor'}
        </Button>
        <SortableResumeSections
          sections={sections}
          work={work}
          education={education}
          skills={skills}
          projects={projects}
          awards={awards}
          onSortEnd={this.onSortEnd}
        />
      </Section>
    )
  }
}

const selector = formValueSelector('resume')

function mapState(state: State) {
  return {
    basics: state.form.resume.values.basics,
    work: state.form.resume.values.work,
    education: state.form.resume.values.education,
    skills: state.form.resume.values.skills,
    projects: state.form.resume.values.projects,
    awards: state.form.resume.values.awards,
    selectedTemplate: state.form.resume.values.selectedTemplate,
    tailorDescription: selector(state, 'tailor.description'),
    sections: state.progress.sections,
    tailorUpload: state.form.resume.tailorUpload,
    tailorSections: state.form.resume.values.tailor.sections
  }
}

export default connect(mapState)(Tailor)
