/**
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import Section from './Section'
import LabeledInput, { Input, Label } from '../fragments/LabeledInput'
import { Icon, RoundButton } from '../../../../common/components'
import type { FormValues } from '../../types'
import type { State } from '../../../../app/types'
import styled from 'styled-components'

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
  selectedTemplate: $PropertyType<FormValues, 'selectedTemplate'>
}

function Tailor({
  basics,
  work,
  education,
  skills,
  projects,
  awards,
  selectedTemplate
}: Props) {
  return (
    <Section heading="Tailor Your Resume">
      {/* TODO: Add UI components for tailoring */}
    </Section>
  )
}

function mapState(state: State) {
  return {
    basics: state.form.resume.values.basics,
    work: state.form.resume.values.work,
    education: state.form.resume.values.education,
    skills: state.form.resume.values.skills,
    projects: state.form.resume.values.projects,
    awards: state.form.resume.values.awards,
    selectedTemplate: state.form.resume.values.selectedTemplate
  }
}

export default connect(mapState)(Tailor)
